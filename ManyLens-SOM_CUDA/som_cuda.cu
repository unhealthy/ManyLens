#include "som_cuda.cuh" 

//Initialize CUDA
int InitializeCUDA(void)
{
	int count = 0;
	std::cout << "Start to detecte devices.........\n";
	cudaGetDeviceCount(&count);
	if (count == 0)
	{
		std::cerr << "There is no device.\n";
		return 1;
	}

	std::cout << count << " device detected.\n";
	int i;

	for (i = 0; i < count; i++)
	{
		cudaDeviceProp prop;
		if (cudaGetDeviceProperties(&prop, i) == cudaSuccess)
		{
			if (prop.major >= 1)
			{
				std::cout << "Device:" << i + 1 << " supports CUDA " << prop.name << "." << prop.major << "." << prop.minor << std::endl;
				break;
			}
		}
	}
	if (i == count)
	{
		std::cerr << "There is no device supporting CUDA 1.x.\n";
		return 1;
	}
	cudaSetDevice(i);


	return 2;
}

//Do clean up
int CleanUp()
{
	cudaError_t cudaStatus = cudaDeviceReset();
	if (cudaStatus != cudaSuccess) {
		fprintf(stderr, "cudaDeviceReset failed!");
		return 1;
	}
	return 0;
}

template <typename T> int sgn(T val)
{
	return (T(0) < val) - (val < T(0));
}

void somFree(float* pointer)
{
	delete[] pointer;
	pointer = NULL;
}

bool CPUcheckEuclideanResult(const float* d_result,
	const float* d_weights,
	const float* d_input,
	const unsigned int* d_BID,
	unsigned int inputIndex,
	int neuron_number,
	int batch_number,
	int dimension,
	int flag)
{
	float* h_weights = new float[neuron_number*dimension];
	float* h_input = new float[batch_number*dimension];
	float* h_checkresult = new float[neuron_number*batch_number];
	unsigned int* h_checkBID = new unsigned int[batch_number];
	cudaMemcpy(h_checkBID, d_BID, batch_number*sizeof(unsigned int), cudaMemcpyDeviceToHost);
	cudaMemcpy(h_checkresult, d_result, neuron_number*batch_number*sizeof(float), cudaMemcpyDeviceToHost);
	cudaMemcpy(h_weights, d_weights, neuron_number*dimension*sizeof(float), cudaMemcpyDeviceToHost);
	cudaMemcpy(h_input, d_input + inputIndex*dimension, batch_number*dimension*sizeof(float), cudaMemcpyDeviceToHost);
	if (flag == -1)
	{
		inputIndex += 40000000;
	}

	/*--------------- check the intermidiateResult of each batch -----------------*/
	std::ofstream fout("../result/h_intermidiateResult" + std::to_string(inputIndex) + ".txt");
	for (int i = 0; i < batch_number; ++i)
	{
		for (int j = 0; j < neuron_number; ++j)
		{
			if (j == (neuron_number - 1))
				fout << h_checkresult[j + i*neuron_number];
			else
				fout << h_checkresult[j + i*neuron_number] << " ";
		}
		if (i != (batch_number - 1))
			fout << std::endl;
	}
	fout.close();

	/*--------------- check the input of each batch -----------------*/
	fout.open("../result/h_input" + std::to_string(inputIndex) + ".txt");
	for (int i = 0; i < batch_number; ++i)
	{
		for (int j = 0; j < dimension; ++j)
		{

			if (j == (dimension - 1))
				fout << h_input[j + i*dimension];
			else
				fout << h_input[j + i*dimension] << " ";
		}
		if (i != (batch_number - 1))
			fout << std::endl;
	}
	fout.close();

	/*--------------- check the result of weights update -----------------*/
	fout.open("../result/weights" + std::to_string(inputIndex) + ".txt");
	for (int i = 0; i < neuron_number; ++i)
	{
		for (int j = 0; j < dimension; j++)
		{
			if (j == (dimension - 1))
				fout << h_weights[j*neuron_number + i];
			else
				fout << h_weights[j*neuron_number + i] << " ";
		}
		if (i != (neuron_number - 1))
			fout << std::endl;
	}
	fout.close();

	/*------------------ Check the BID ----------------*/
	fout.open("../result/bID" + std::to_string(inputIndex) + ".txt");

	for (int j = 0; j < batch_number; j++)
	{
		if (j == (batch_number - 1))
			fout << h_checkBID[j];
		else
			fout << h_checkBID[j] << std::endl;
	}
	fout.close();


	delete[] h_checkresult;
	delete[] h_input;
	delete[] h_weights;
	delete[] h_checkBID;
	h_checkBID = NULL;
	h_checkresult = NULL;
	h_input = NULL;
	h_weights = NULL;
	return true;
}

//Calculate the distance between each neuron and input vector
//this kernel assumes d_weights is column-major          d_weights(dimension, neuron_number)
//this kernel assumes d_input_set is row-major           d_input_set(batch_size, dimension)
//this kernel assumes d_result is column-major           d_result(batch_size,neuron_number)
//this kernel assumes number of threads per threadblock == DIMENSION
//CHKSIZE is the number of d_weights vectors that will be compute per block
__global__ void Calculate_Euclidean_Distance_Kernel(const float *d_weights,
	const float *d_input_set,
	const unsigned input_index_of_this_batch,
	const int batch_size,
	const int neuron_number,
	float *d_result)
{
	__shared__ float shared_input_set[CHKSIZE * DIMENSION];		//enough shared storage for CHKSIZE vectors of d_input_set	
	int bx = blockIdx.x;										//one block per CHKSIZE rows of d_input_set
	int tx = threadIdx.x;
	float result[CHKSIZE];

	int numCHKSIZE = (bx + 1) * CHKSIZE < batch_size ? CHKSIZE : batch_size - bx*CHKSIZE;
#pragma unroll
	for (int i = 0; i < numCHKSIZE; i++)
		shared_input_set[(i * DIMENSION) + tx] = d_input_set[((input_index_of_this_batch + (bx * CHKSIZE) + i) * DIMENSION) + tx];
	__syncthreads();

	//loop across all vectors in d_weights
	while (tx < neuron_number)
	{
#pragma unroll
		for (int i = 0; i < numCHKSIZE; i++)
			result[i] = 0.0f;

		for (int i = 0; i < DIMENSION; i++)
		{
			float Atemp = d_weights[(neuron_number * i) + tx];
			//compute all CHKSIZE d_input_set vectors with read of d_weights
#pragma unroll
			for (int j = 0; j < numCHKSIZE; j++)
			{
				float temp = Atemp - shared_input_set[i + (j * DIMENSION)];
				result[j] += temp * temp;
			}
		}

		//store CHKSIZE results
#pragma unroll
		for (int i = 0; i < numCHKSIZE; i++)
			d_result[(i + (bx * CHKSIZE)) * neuron_number + tx] = result[i];

		tx += blockDim.x;
	}
}

//Find out the index of min element
__global__ void Min_Reduce_Kernel(const float* d_result, unsigned int* d_BID, const size_t neuronNum)
{
	__shared__ float sValue[512];
	__shared__ int sIndex[512];

	int tx = threadIdx.x;
	int stride = blockIdx.x*neuronNum;
	int gid = tx + stride;
	int upper = stride + neuronNum;

	sValue[tx] = FLT_MAX;
	sIndex[tx] = gid;
	float temp;
	while (gid < upper) {
		temp = d_result[gid];

		sIndex[tx] = sValue[tx] > temp ? gid : sIndex[tx];
		sValue[tx] = sValue[tx] > temp ? temp : sValue[tx];

		gid += blockDim.x;
	}
	__syncthreads();

	if (tx < 256)
	{
		sIndex[tx] = sValue[tx] > sValue[tx + 256] ? sIndex[tx + 256] : sIndex[tx];
		sValue[tx] = sValue[tx] > sValue[tx + 256] ? sValue[tx + 256] : sValue[tx];
	}
	__syncthreads();
	if (tx < 128)
	{
		sIndex[tx] = sValue[tx] > sValue[tx + 128] ? sIndex[tx + 128] : sIndex[tx];
		sValue[tx] = sValue[tx] > sValue[tx + 128] ? sValue[tx + 128] : sValue[tx];
	}
	__syncthreads();
	if (tx < 64)
	{
		sIndex[tx] = sValue[tx] > sValue[tx + 64] ? sIndex[tx + 64] : sIndex[tx];
		sValue[tx] = sValue[tx] > sValue[tx + 64] ? sValue[tx + 64] : sValue[tx];
	}
	__syncthreads();
	if (tx < 32)
	{
		if (sValue[tx] > sValue[tx + 32])
		{
			sValue[tx] = sValue[tx + 32];
			sIndex[tx] = sIndex[tx + 32];
		}
		if (sValue[tx] > sValue[tx + 16])
		{
			sValue[tx] = sValue[tx + 16];
			sIndex[tx] = sIndex[tx + 16];
		}
		if (sValue[tx] > sValue[tx + 8])
		{
			sValue[tx] = sValue[tx + 8];
			sIndex[tx] = sIndex[tx + 8];
		}
		if (sValue[tx] > sValue[tx + 4])
		{
			sValue[tx] = sValue[tx + 4];
			sIndex[tx] = sIndex[tx + 4];
		}

		if (sValue[tx] > sValue[tx + 2])
		{
			sValue[tx] = sValue[tx + 2];
			sIndex[tx] = sIndex[tx + 2];
		}
		//sIndex[tx] = sValue[tx] > sValue[tx+2] ? sIndex[tx+2] : sIndex[tx];
		//sValue[tx] = sValue[tx] > sValue[tx+2] ? sValue[tx+2] : sValue[tx];

		sIndex[tx] = sValue[tx] > sValue[tx + 1] ? sIndex[tx + 1] : sIndex[tx];
		sValue[tx] = sValue[tx] > sValue[tx + 1] ? sValue[tx + 1] : sValue[tx];
	}
	if (tx == 0)
	{
		d_BID[blockIdx.x] = sIndex[0] - stride;
	}
}

//Find the best match neuron by using bathc kernel function.
bool Find_Best_Match_Neuron(const float* d_weights,
	const unsigned int neuron_number,
	const float* d_input_set,
	const unsigned int input_index_of_this_batch,
	const unsigned int batch_size,
	unsigned int* d_BID,
	float* d_result)
{
	cudaError_t cudaStatus;
	dim3 threads(DIMENSION);
	dim3 blocks(ceil((double)batch_size / (double)CHKSIZE));
	Calculate_Euclidean_Distance_Kernel <<<blocks, threads>>>(d_weights, d_input_set, input_index_of_this_batch, batch_size, neuron_number, d_result);
	cudaStatus = cudaDeviceSynchronize();
	if (cudaStatus != cudaSuccess) {
		fprintf(stderr, "cudaDeviceSynchronize returned error code %d after launching EuclideanDistancesBMU!\n", cudaStatus);
		return false;
	}

	cudaFuncSetCacheConfig(Min_Reduce_Kernel, cudaFuncCachePreferL1);
	Min_Reduce_Kernel <<<batch_size, 512>>>(d_result, d_BID,neuron_number);
	cudaStatus = cudaDeviceSynchronize();
	if (cudaStatus != cudaSuccess) {
		fprintf(stderr, "cudaDeviceSynchronize returned error code %d after launching min reduce!\n", cudaStatus);
		return false;
	}

	return true;
}

//Find out the index of min element
__global__ void Output_Min_Reduce_Kernel(const float* d_result, unsigned int* d_BID, float* d_error, const size_t neuronNum)
{
	__shared__ float sValue[512];
	__shared__ int sIndex[512];

	int tx = threadIdx.x;
	int stride = blockIdx.x*neuronNum;
	int gid = tx + stride;
	int upper = stride + neuronNum;

	sValue[tx] = FLT_MAX;
	sIndex[tx] = gid;
	float temp;
	while (gid < upper) {
		temp = d_result[gid];

		sIndex[tx] = sValue[tx] > temp ? gid : sIndex[tx];
		sValue[tx] = sValue[tx] > temp ? temp : sValue[tx];

		gid += blockDim.x;
	}
	__syncthreads();

	if (tx < 256)
	{
		sIndex[tx] = sValue[tx] > sValue[tx + 256] ? sIndex[tx + 256] : sIndex[tx];
		sValue[tx] = sValue[tx] > sValue[tx + 256] ? sValue[tx + 256] : sValue[tx];
	}
	__syncthreads();
	if (tx < 128)
	{
		sIndex[tx] = sValue[tx] > sValue[tx + 128] ? sIndex[tx + 128] : sIndex[tx];
		sValue[tx] = sValue[tx] > sValue[tx + 128] ? sValue[tx + 128] : sValue[tx];
	}
	__syncthreads();
	if (tx < 64)
	{
		sIndex[tx] = sValue[tx] > sValue[tx + 64] ? sIndex[tx + 64] : sIndex[tx];
		sValue[tx] = sValue[tx] > sValue[tx + 64] ? sValue[tx + 64] : sValue[tx];
	}
	__syncthreads();
	if (tx < 32)
	{
		if (sValue[tx] > sValue[tx + 32])
		{
			sValue[tx] = sValue[tx + 32];
			sIndex[tx] = sIndex[tx + 32];
		}
		if (sValue[tx] > sValue[tx + 16])
		{
			sValue[tx] = sValue[tx + 16];
			sIndex[tx] = sIndex[tx + 16];
		}
		if (sValue[tx] > sValue[tx + 8])
		{
			sValue[tx] = sValue[tx + 8];
			sIndex[tx] = sIndex[tx + 8];
		}
		if (sValue[tx] > sValue[tx + 4])
		{
			sValue[tx] = sValue[tx + 4];
			sIndex[tx] = sIndex[tx + 4];
		}

		if (sValue[tx] > sValue[tx + 2])
		{
			sValue[tx] = sValue[tx + 2];
			sIndex[tx] = sIndex[tx + 2];
		}
		//sIndex[tx] = sValue[tx] > sValue[tx+2] ? sIndex[tx+2] : sIndex[tx];
		//sValue[tx] = sValue[tx] > sValue[tx+2] ? sValue[tx+2] : sValue[tx];

		sIndex[tx] = sValue[tx] > sValue[tx + 1] ? sIndex[tx + 1] : sIndex[tx];
		sValue[tx] = sValue[tx] > sValue[tx + 1] ? sValue[tx + 1] : sValue[tx];
	}
	if (tx == 0)
	{
		d_BID[blockIdx.x] = sIndex[0] - stride;
		d_error[blockIdx.x] = sValue[0];
	}
}

//Find the best match neuron by using bathc kernel function.
bool Output_BID_Error(const float* d_weights,
	const unsigned int neuron_number,
	const float* d_input_set,
	const unsigned int input_index_of_this_batch,
	const unsigned int batch_size,
	unsigned int* d_BID,
	float* d_result,
	float* d_error)
{
	cudaError_t cudaStatus;
	dim3 threads(DIMENSION);
	dim3 blocks(ceil((double)batch_size / (double)CHKSIZE));
	Calculate_Euclidean_Distance_Kernel <<<blocks, threads>>>(d_weights, d_input_set, input_index_of_this_batch, batch_size, neuron_number, d_result);
	cudaStatus = cudaDeviceSynchronize();
	if (cudaStatus != cudaSuccess) {
		fprintf(stderr, "cudaDeviceSynchronize returned error code %d after launching EuclideanDistancesBMU!\n", cudaStatus);
		return false;
	}


	cudaFuncSetCacheConfig(Min_Reduce_Kernel, cudaFuncCachePreferL1);
	Output_Min_Reduce_Kernel <<<batch_size, 512>>>(d_result, d_BID, d_error, neuron_number);
	cudaStatus = cudaDeviceSynchronize();
	if (cudaStatus != cudaSuccess) {
		fprintf(stderr, "cudaDeviceSynchronize returned error code %d after launching min reduce!\n", cudaStatus);
		return false;
	}

	return true;
}

//Update weight of each neuron
__global__ void Update_Map_Map_Kernel(const float* d_input_set,
	const int input_index_of_this_batch,
	const float* d_distance,
	const unsigned int* bID,
	const unsigned int batch_size,
	const float fsigmaT,
	float* d_weights)
{
	int tx = threadIdx.x;
	int bx = blockIdx.x;
	float denominator = 0.f;
	float numerator = 0.f;
	int index_factor = gridDim.x - 1;
	__shared__ float tempDenominator[DIMENSION];		//DIMENSION*CHKSIZE
	int count = 0;
	int upper = ceilf((float)batch_size / (float)DIMENSION);
	for (int j = 0; j < upper; ++j)
	{
		if (tx < batch_size)
		{
			int bid = bID[tx];				//the id of best match neuron
			/* Find the bigger one between bid and bx, 'a' is the bigger one*/
			int a = bx + bid;
			int b = bx < bid ? bx : bid;
			a = a - b;
			int index = a + index_factor * b - 1 - (b + 1) * b * 0.5;

			//Calculate the influence of each input vector
			float tempDist = bx^bid ? d_distance[index + 1] : 0;

			tempDenominator[threadIdx.x] = bx^bid ? expf(-tempDist / fsigmaT) : 1;
			__syncthreads();
		}

		count = (j + 1)*DIMENSION < batch_size ? DIMENSION : (batch_size - j * DIMENSION);
		//Sum up the influence
		for (int i = 0; i < count; ++i)
		{
			numerator += tempDenominator[i] * d_input_set[threadIdx.x + ((input_index_of_this_batch + (j * DIMENSION) + i) * DIMENSION)];
			denominator += tempDenominator[i];
		}
		tx += DIMENSION;
	}
	//Update the weight of each neuron
	d_weights[threadIdx.x * gridDim.x + bx] = numerator / denominator;
}

//Update weight of each neuron vector
bool Update_Map(const float* d_distance,
	const unsigned int neuron_number,
	const float* d_input_set,
	const int input_index_of_this_batch,
	const unsigned int* bID,
	const unsigned int batch_size,
	const int dimension,
	const float fsigmaT,
	float * d_weights)
{

	cudaError_t cudaStatus;
	cudaFuncSetCacheConfig(Update_Map_Map_Kernel, cudaFuncCachePreferL1);
	//dim3 blocks(ceil((double)dimension/512.0),neuron_number);
	//Update_Map_Map_Kernel<<<blocks,512>>>(d_input_set,dimension,input_index_of_this_batch,d_distance,bID,batch_size,
	Update_Map_Map_Kernel <<<neuron_number, DIMENSION>>>(d_input_set, input_index_of_this_batch, d_distance, bID, batch_size, fsigmaT, d_weights);
	cudaStatus = cudaDeviceSynchronize();
	if (cudaStatus != cudaSuccess)
	{
		fprintf(stderr, "Update_Map_Map_Kernel returned error code %d after launching Update_Map_Map_Kernel!\n", cudaStatus);
		std::cout << input_index_of_this_batch << " " << batch_size << " " << fsigmaT << std::endl;
		std::ofstream ferr_BID("../result/error_BID.txt");
		std::ofstream ferr_Input("../result/error_input.txt");
		int * e_BID = new int[batch_size];
		float * e_input_set = new float[dimension*batch_size];
		cudaMemcpy(e_BID, bID, batch_size*sizeof(unsigned int), cudaMemcpyDeviceToHost);
		cudaMemcpy(e_input_set, d_input_set + dimension*input_index_of_this_batch, dimension*batch_size*sizeof(float), cudaMemcpyDeviceToHost);
		for (int i = 0; i < batch_size; i++)
		{
			ferr_BID << e_BID[i] << std::endl;
			for (int j = 0; j < dimension; ++j)
			{
				if (j == (dimension - 1))
					ferr_Input << e_input_set[j + i*dimension];
				else
					ferr_Input << e_input_set[j + i*dimension] << " ";
			}
			if (i != (batch_size - 1))
				ferr_Input << std::endl;
		}
		return false;
	}
	return true;
}

//A function for randomMapping. It's not use until now.
float* RandomMapping(const float* h_gaussin,
	const float *h_source,
	const int dimension_after_random_mapping,
	const int dimension_before_random_mapping,
	const int input_set_size)
{
	float *d_source, *d_gaussin, *d_result;

	cublasInit();

	cublasAlloc(input_set_size * dimension_before_random_mapping, sizeof(float), (void**)&d_source);
	cublasAlloc(dimension_after_random_mapping * dimension_before_random_mapping, sizeof(float), (void**)&d_gaussin);
	cublasAlloc(dimension_after_random_mapping * input_set_size, sizeof(float), (void**)&d_result);
	cublasSetMatrix(dimension_before_random_mapping, input_set_size, sizeof(float), h_source, dimension_before_random_mapping, d_source, dimension_before_random_mapping);
	cublasSetMatrix(dimension_after_random_mapping, dimension_before_random_mapping, sizeof(float), h_gaussin, dimension_after_random_mapping, d_gaussin, dimension_after_random_mapping);

	cudaThreadSynchronize();

	cublasSgemm('n', 'n',
		dimension_after_random_mapping, input_set_size, dimension_before_random_mapping,
		1.0f, d_gaussin, dimension_after_random_mapping,
		d_source, dimension_before_random_mapping,
		0.0f, d_result, dimension_after_random_mapping);

	cudaThreadSynchronize();
	cudaFree(d_gaussin);
	cudaFree(d_source);

	return d_result;
}

const int TILE_DIM = 32;
const int BLOCK_ROWS = 8;
__global__ void transposeNoBankConflicts(float *odata, const float *idata)
{
	__shared__ float tile[TILE_DIM][TILE_DIM + 1];

	int x = blockIdx.x * TILE_DIM + threadIdx.x;
	int y = blockIdx.y * TILE_DIM + threadIdx.y;
	int width = gridDim.x * TILE_DIM;
	int tWidth = gridDim.y * TILE_DIM;

	for (int j = 0; j < TILE_DIM; j += BLOCK_ROWS)
		tile[threadIdx.y + j][threadIdx.x] = idata[(y + j)*width + x];

	__syncthreads();

	x = blockIdx.y * TILE_DIM + threadIdx.x;  // transpose block offset
	y = blockIdx.x * TILE_DIM + threadIdx.y;

	for (int j = 0; j < TILE_DIM; j += BLOCK_ROWS)
		odata[(y + j)*tWidth + x] = tile[threadIdx.x][threadIdx.y + j];
}
float* Transpose(float* d_temp_weight, const int oldX, const int oldY)
{
	dim3 dimGrid(oldX / TILE_DIM, oldY / TILE_DIM, 1);
	dim3 dimBlock(TILE_DIM, BLOCK_ROWS, 1);

	float* d_weights = 0;
	cudaMalloc((void**)&d_weights, oldX * oldY * sizeof(float));

	transposeNoBankConflicts <<<dimGrid, dimBlock>>>(d_weights, d_temp_weight);
	cudaFree(d_temp_weight);
	return d_weights;
}

//unsigned int* SOM(const float* h_inputSet,
//	const unsigned int input_set_size,
//	const unsigned int dimension,
//	const unsigned int height,
//	const unsigned int width,
//	const unsigned int batch_size,
//	const int epochNum,
//	const float lambda,
//	const float iterNum)
//{
//	const unsigned int d_input_set_size = input_set_size;							//define the input set size on device
//	const unsigned int neuron_number = height * width;								//the number of neuron
//	const unsigned int real_dimension = dimension;
//	float iter = 0;																	//iteration
//
//	int distance_table_length = (int)(1 +
//		neuron_number * (neuron_number - 1) * 0.5);		//the length of distance Table
//	float* h_weights = new float[real_dimension * neuron_number];					//weights of each neuron in host memory
//	float* h_distance = new float[distance_table_length];							//distance table in host memory
//	int* h_position = new int[2 * neuron_number];									//position--(x,y)--of each neuron in host memory
//
//	float* d_weights = 0;															//weights of each neuron in device memory
//	float* d_distance = 0;															//distance table in device memory
//	float* d_input_set = 0;															//input set in device memory
//	unsigned int* d_BID = 0;														//the id of best match neurons in device memory
//	float* d_intermediate_result = 0;
//
//	cudaMalloc((void**)&d_weights, real_dimension * neuron_number * sizeof(float));
//	cudaMalloc((void**)&d_distance, distance_table_length * sizeof(float));
//	cudaMalloc((void**)&d_BID, batch_size * sizeof(unsigned int));
//	cudaMalloc((void**)&d_intermediate_result, neuron_number * batch_size * sizeof(float));
//	cudaMalloc((void**)&d_input_set, real_dimension*d_input_set_size*sizeof(float));
//	cudaMemcpy(d_input_set, h_inputSet, real_dimension*d_input_set_size*sizeof(float), cudaMemcpyHostToDevice);
//
//	/*----------------- Initialize the distance table --------------------*/
//	bool flag = true;
//	int x = 0;
//	int y = 0;
//	for (int i = 0, t = 0; i < height; ++i)
//	{
//		x = 0;
//		for (int j = 0; j < 2 * width; ++j)
//		{
//
//			if (flag)
//			{
//				h_position[t] = x;
//				flag = false;
//				++x;
//				++t;
//
//			}
//			else
//			{
//				h_position[t] = y;
//				flag = true;
//				++t;
//
//			}
//		}
//		y++;
//	}
//
//	h_distance[0] = 0;
//	for (unsigned int i = 0, t = 1; i < neuron_number - 1; ++i)
//	{
//		for (unsigned int j = i + 1; j < neuron_number; ++j)
//		{
//			int dX = (h_position[2 * i] - h_position[2 * j]) * (h_position[2 * i] - h_position[2 * j]);
//			int dY = (h_position[2 * i + 1] - h_position[2 * j + 1]) * (h_position[2 * i + 1] - h_position[2 * j + 1]);
//			h_distance[t] = dX + dY;
//			++t;
//		}
//	}
//	cudaMemcpy(d_distance, h_distance, distance_table_length * sizeof(float), cudaMemcpyHostToDevice);
//
//	std::cout << "Initialize the positioin done" << std::endl;
//
//	/*-----------Initialize the weights of each neuron---------------------*/
//	float *h_temp_weight = new float[neuron_number*real_dimension];
//	cudaMemcpy(h_temp_weight, d_input_set, neuron_number*real_dimension*sizeof(float), cudaMemcpyDeviceToHost);
//	for (unsigned int i = 0; i < neuron_number; ++i)
//	{
//		for (unsigned int j = 0; j < real_dimension; ++j)
//		{
//			h_weights[i + j * neuron_number] = h_temp_weight[i*real_dimension + j];
//		}
//	}
//	cudaMemcpy(d_weights, h_weights, neuron_number* real_dimension  * sizeof(float), cudaMemcpyHostToDevice);
//	delete[] h_temp_weight;
//	h_temp_weight = NULL;
//	std::cout << "Initialize the weights done" << std::endl;
//
//	//Let's begin SOM
//	for (int i = 0; i < epochNum; i++)
//	{
//		for (unsigned int iCycle = 0; iCycle < (d_input_set_size / batch_size); iCycle++)
//		{
//			int inputx = iCycle * batch_size;
//			if (!Find_Best_Match_Neuron(d_weights, neuron_number, d_input_set, inputx, batch_size, d_BID, d_intermediate_result))
//			{
//				break;
//			}
//
//			//float sigmaT = (0.5*height * exp(-iter/lambda));
//			float sigmaT = 0.28*width*(1 - lambda*iter);
//			if (sigmaT < 0.5)
//				sigmaT = 0.5;
//			std::cout << sigmaT << std::endl;
//			sigmaT = 2 * sigmaT * sigmaT;
//			if (!Update_Map(d_distance, neuron_number, d_input_set, inputx, d_BID, batch_size, real_dimension, sigmaT, d_weights))
//			{
//				break;
//			}
//			iter += iterNum;
//		}
//	}
//
//	std::cout << "Som training done" << std::endl;
//
//	unsigned int* h_output = new unsigned int[input_set_size];
//	for (unsigned int iCycle = 0; iCycle < (d_input_set_size / batch_size); iCycle++)
//	{
//		int inputx = iCycle * batch_size;
//		std::cout << inputx << std::endl;
//		if (!Find_Best_Match_Neuron(d_weights, neuron_number, d_input_set, inputx, batch_size, d_BID, d_intermediate_result))
//		{
//			break;
//		}
//		cudaMemcpy(h_output + inputx, d_BID, batch_size*sizeof(unsigned int), cudaMemcpyDeviceToHost);
//	}
//
//	/*--------------- check the result of final weights update -----------------*/
//	std::ofstream fweightout("../data/somweightsFinal");
//	cudaMemcpy(h_weights, d_weights, neuron_number * real_dimension * sizeof(float), cudaMemcpyDeviceToHost);
//	for (int i = 0; i < neuron_number; ++i)
//	{
//		for (int j = 0; j < dimension; j++)
//		{
//			fweightout << h_weights[i + j * neuron_number] << " ";
//		}
//		fweightout << std::endl;
//	}
//	fweightout.close();
//
//	std::cout << "everything done" << std::endl;
//	cudaFree(d_weights);
//	cudaFree(d_input_set);
//	cudaFree(d_BID);
//	cudaFree(d_intermediate_result);
//	cudaFree(d_distance);
//	delete[] h_position;
//	delete[] h_weights;
//	delete[] h_distance;
//	h_distance = NULL;
//	h_position = NULL;
//	h_weights = NULL;
//
//	return h_output;
//}

float* SOMwithRandomMapping(const float* h_gaussin,
							const float* h_inputSet,
							const float* h_initial_weight,
							const unsigned int input_set_size,
							const unsigned int dimension,
							const unsigned int height,
							const unsigned int width,
							const unsigned int batch_size,
							const int epochNum,
							const float lambda,
							const float iterNum)
{
	const unsigned int d_input_set_size = input_set_size;								//define the input set size on device
	const unsigned int dimension_before_random_mapping = dimension;						//the original dimension of the input set
	const unsigned int dimension_after_random_mapping = DIMENSION;						//dimension after random mapping, can not change
	const unsigned int neuron_number = height * width;									//the number of neuron
	float iter = 0;																		//iteration

	int distance_table_length = (int)(1 +
		neuron_number * (neuron_number - 1) * 0.5);										//the length of distance Table
	float* h_distance = new float[distance_table_length];								//distance table in host memory
	int* h_position = new int[2 * neuron_number];										//position--(x,y)--of each neuron in host memory

	float* d_weights = 0;																//weights of each neuron in device memory
	float* d_distance = 0;																//distance table in device memory
	unsigned int* d_BID = 0;															//the id of best match neurons in device memory
	float* d_intermediate_result = 0;
	float* d_input_set = 0;																//input set in device memory

	cudaMalloc((void**)&d_weights, dimension_after_random_mapping * neuron_number * sizeof(float));
	cudaMalloc((void**)&d_distance, distance_table_length * sizeof(float));
	cudaMalloc((void**)&d_BID, batch_size * sizeof(unsigned int));
	cudaMalloc((void**)&d_intermediate_result, neuron_number * batch_size * sizeof(float));
	d_input_set = RandomMapping(h_gaussin, h_inputSet, dimension_after_random_mapping, dimension_before_random_mapping, input_set_size);

	/*--------------- check the result of random mapping -----------------*/
	/*float* h_checkRM = new float[dimension_after_random_mapping*input_set_size];
	cudaMemcpy(h_checkRM,d_input_set,dimension_after_random_mapping*input_set_size*sizeof(float),cudaMemcpyDeviceToHost);
	fout.open(logPath+"rmvtrain");
	for(int i =0; i<input_set_size;++i)
	{
	for(int j = 0; j<dimension_after_random_mapping;++j)
	{
	if (j == (dimension_after_random_mapping - 1))
	{
	fout << h_checkRM[j + i*dimension_after_random_mapping];
	}
	else
	{
	fout << h_checkRM[j + i*dimension_after_random_mapping] << " ";
	}

	}
	if(i!=(input_set_size -1 ))
	fout<<std::endl;
	}
	fout.close();
	delete[] h_checkRM;
	h_checkRM = NULL;*/
	//fout.open("../data/vtrain");
	//for(int i =0; i<input_set_size;++i)
	//{
	//	for(int j = 0; j<dimension_before_random_mapping;++j)
	//	{
	//		if(j == (dimension_before_random_mapping - 1))
	//			fout<<h_inputSet[j+i*dimension_before_random_mapping];
	//		else
	//			fout<<h_inputSet[j+i*dimension_before_random_mapping]<<" ";
	//	}
	//	if(i!=(input_set_size -1 ))
	//		fout<<std::endl;
	//}
	//fout.close();

	/*----------------- Initialize the position table --------------------*/
	bool flag = true;
	int x = 0;
	int y = 0;
	for (int i = 0, t = 0; i < height; ++i)
	{
		//x = (i+1)/2;
		x = 0;
		for (int j = 0; j < 2 * width; ++j)
		{
			if (flag)
			{
				h_position[t] = x;
				flag = false;
				++x;
				++t;
			}
			else
			{
				h_position[t] = y;
				flag = true;
				++t;
			}
		}
		y++;
	}

	/*----------------- Initialize the distance table --------------------*/
	h_distance[0] = 0;
	for (unsigned int i = 0, t = 1; i < neuron_number - 1; ++i)
	{
		for (unsigned int j = i + 1; j < neuron_number; ++j)
		{
			int dX = (h_position[2 * i] - h_position[2 * j]) * (h_position[2 * i] - h_position[2 * j]);
			int dY = (h_position[2 * i + 1] - h_position[2 * j + 1]) * (h_position[2 * i + 1] - h_position[2 * j + 1]);

			if (sgn<int>(dX) == sgn<int>(dY))
			{
				h_distance[t] = abs(dX + dY);
			}
			else
			{
				h_distance[t] = abs(dX) > abs(dY) ? abs(dX) : abs(dY);
			}

			h_distance[t] = h_distance[t] * h_distance[t];
			//h_distance[t] = dX + dY;
			++t;
		}
	}
	cudaMemcpy(d_distance, h_distance, distance_table_length * sizeof(float), cudaMemcpyHostToDevice);

	/*-----------Initialize the weights of each neuron---------------------*/
	if (h_initial_weight != 0)
	{
		cudaMemcpy(d_weights, h_initial_weight, neuron_number*dimension_after_random_mapping * sizeof(float), cudaMemcpyHostToDevice);
	}
	else
	{
		cudaMemcpy(d_weights, d_input_set, neuron_number* dimension_after_random_mapping * sizeof(float), cudaMemcpyDeviceToDevice);
		d_weights = Transpose(d_weights, dimension_after_random_mapping, neuron_number);
	}
	//std::ofstream fout("D:\\SOMLog\\Nuilliswhat");
	//fout << h_initial_weight;
	//fout.close();

	//Let's begin SOM
	for (int i = 0; i < epochNum; i++)
	{
		for (unsigned int iCycle = 0; iCycle < ceil(d_input_set_size / batch_size); iCycle++)
		{
			int inputx = iCycle * batch_size;
			if (!Find_Best_Match_Neuron(d_weights, neuron_number, d_input_set, inputx, batch_size, d_BID, d_intermediate_result))
			{
				break;
			}

			float sigmaT = 0.28*width*(1 - lambda*iter);
			if (sigmaT < 1)
				sigmaT = 1;
			sigmaT = 2 * sigmaT * sigmaT;
			if (!Update_Map(d_distance, neuron_number, d_input_set, inputx, d_BID, batch_size, dimension_after_random_mapping, sigmaT, d_weights))
			{
				break;
			}
			iter += iterNum;
		}
	}

	/*---------------Output -----------------*/
	float* h_output = new float[input_set_size * 2 + dimension_after_random_mapping*neuron_number];
	float* d_error = 0;
	cudaMalloc((void**)&d_error, batch_size * sizeof(float));
	for (unsigned int iCycle = 0; iCycle < ceil(input_set_size / batch_size); iCycle++)
	{
		int inputx = iCycle * batch_size;
		if (!Output_BID_Error(d_weights, neuron_number, d_input_set, inputx, batch_size, d_BID, d_intermediate_result,d_error))
		{
			break;
		}
		//Copy best match unit
		cudaMemcpy(h_output + inputx, d_BID, batch_size*sizeof(unsigned int), cudaMemcpyDeviceToHost);
		cudaMemcpy(h_output + inputx + input_set_size, d_error, batch_size*sizeof(float), cudaMemcpyDeviceToHost);
	}
	//Copy the final weights
	cudaMemcpy(h_output + input_set_size*2, d_weights, dimension_after_random_mapping*neuron_number*sizeof(float), cudaMemcpyDeviceToHost);

	/*--------------- check the result of final weights update -----------------*/
	std::ofstream fweightout("D:\\SOMLog\\weights_in_columnmajor");
	for (int i = 0; i < neuron_number; ++i)
	{
		for (int j = 0; j < dimension_after_random_mapping; j++)
		{
			fweightout << h_output[input_set_size*2 + i + j * neuron_number] << " ";
		}
		fweightout << std::endl;
	}
	fweightout.close();
	std::ofstream fbid("D:\\SOMLog\\bid");
	int* bid = new int[input_set_size];
	memcpy(bid, h_output, input_set_size*sizeof(unsigned int));
	for (int i = 0; i < d_input_set_size; ++i)
	{
		fbid << bid[i] << std::endl;
	}
	fbid.close();

	cudaFree(d_weights);
	cudaFree(d_input_set);
	cudaFree(d_BID);
	cudaFree(d_intermediate_result);
	cudaFree(d_distance);
	cudaFree(d_error);
	delete[] h_position;
	delete[] h_distance;
	h_distance = NULL;
	h_position = NULL;

	return h_output;
}

unsigned int* SOMClassificationwithRandomMapping(const float* h_gaussin,
	const float* h_inputSet,
	const float* h_classifier_weight,
	const unsigned int input_set_size,
	const unsigned int dimension,
	const unsigned int height,
	const unsigned int width,
	const unsigned int batch_size)
{
	const unsigned int d_input_set_size = input_set_size;										//define the input set size on device
	const unsigned int dimension_before_random_mapping = dimension;						//the original dimension of the input set
	const unsigned int dimension_after_random_mapping = DIMENSION;						//dimension after random mapping, can not change
	const unsigned int neuron_number = height * width;									//the number of neuron

	float* d_weights = 0;																//weights of each neuron in device memory
	float* d_input_set = 0;																//input set in device memory
	unsigned int* d_BID = 0;															//the id of best match neurons in device memory
	float* d_intermediate_result = 0;
	cudaMalloc((void**)&d_weights, dimension_after_random_mapping * neuron_number * sizeof(float));
	cudaMalloc((void**)&d_BID, batch_size * sizeof(unsigned int));
	cudaMalloc((void**)&d_intermediate_result, neuron_number * batch_size * sizeof(float));

	d_input_set = RandomMapping(h_gaussin, h_inputSet, dimension_after_random_mapping, dimension_before_random_mapping, input_set_size);

	/* ------------------- check inpout set --------------------*/
	//float* h_checkRM = new float[dimension_after_random_mapping*input_set_size];
	//cudaMemcpy(h_checkRM,d_input_set,dimension_after_random_mapping*input_set_size*sizeof(float),cudaMemcpyDeviceToHost);
	//std::ofstream fout("../data/rmvtest");
	//for(int i =0; i<input_set_size;++i)
	//{
	//	for(int j = 0; j<dimension_after_random_mapping;++j)
	//	{
	//		if(j == (dimension_after_random_mapping - 1))
	//			fout<<h_checkRM[j+i*dimension_after_random_mapping];
	//		else
	//			fout<<h_checkRM[j+i*dimension_after_random_mapping]<<" ";
	//	}
	//	if(i!=(input_set_size -1 ))
	//		fout<<std::endl;
	//}
	//fout.close();
	//delete[] h_checkRM;
	//h_checkRM = NULL;
	//fout.open("../data/vtest");
	//for(int i =0; i<input_set_size;++i)
	//{
	//	for(int j = 0; j<dimension_before_random_mapping;++j)
	//	{
	//		if(j == (dimension_before_random_mapping - 1))
	//			fout<<h_inputSet[j+i*dimension_before_random_mapping];
	//		else
	//			fout<<h_inputSet[j+i*dimension_before_random_mapping]<<" ";
	//	}
	//	if(i!=(input_set_size -1 ))
	//		fout<<std::endl;
	//}
	//fout.close();

	/*-----------Initialize the weights of each neuron---------------------*/
	cudaMemcpy(d_weights, h_classifier_weight, neuron_number* dimension_after_random_mapping  * sizeof(float), cudaMemcpyHostToDevice);

	/*---------------------------Output----------------------------*/
	unsigned int* h_output = new unsigned int[input_set_size * 2];
	float* d_error = 0;
	cudaMalloc((void**)&d_error, batch_size * sizeof(float));
	for (unsigned int iCycle = 0; iCycle < ceil(d_input_set_size / batch_size); iCycle++)
	{
		int inputx = iCycle * batch_size;
		if (!Output_BID_Error(d_weights, neuron_number, d_input_set, inputx, batch_size, d_BID, d_intermediate_result, d_error))
		{
			break;
		}
		cudaMemcpy(h_output + inputx, d_BID, batch_size*sizeof(unsigned int), cudaMemcpyDeviceToHost);
		cudaMemcpy(h_output + inputx + input_set_size, d_error, batch_size*sizeof(float), cudaMemcpyDeviceToHost);
	}

	cudaFree(d_weights);
	cudaFree(d_input_set);
	cudaFree(d_BID);
	cudaFree(d_intermediate_result);
	cudaFree(d_error);
	return h_output;
}

float* SOMRefinewithRandomMapping(const float* h_gaussin,
														const float* h_inputSet,
														const unsigned int* h_BID,
														const float* h_initial_weight,
														const unsigned int input_set_size,
														const unsigned int dimension,
														const unsigned int height,
														const unsigned int width,
														const unsigned int batch_size)
{
	const unsigned int d_input_set_size = input_set_size;								//define the input set size on device
	const unsigned int dimension_before_random_mapping = dimension;						//the original dimension of the input set
	const unsigned int dimension_after_random_mapping = DIMENSION;						//dimension after random mapping, can not change
	const unsigned int neuron_number = height * width;									//the number of neuron

	int distance_table_length = (int)(1 +
		neuron_number * (neuron_number - 1) * 0.5);										//the length of distance Table
	float* h_distance = new float[distance_table_length];								//distance table in host memory
	int* h_position = new int[2 * neuron_number];										//position--(x,y)--of each neuron in host memory

	float* d_weights = 0;																//weights of each neuron in device memory
	float* d_distance = 0;																//distance table in device memory
	unsigned int* d_BID = 0;															//the id of best match neurons in device memory
	float* d_input_set = 0;																//input set in device memory

	cudaMalloc((void**)&d_weights, dimension_after_random_mapping * neuron_number * sizeof(float));
	cudaMalloc((void**)&d_distance, distance_table_length * sizeof(float));
	cudaMalloc((void**)&d_BID, batch_size * sizeof(unsigned int));
	d_input_set = RandomMapping(h_gaussin, h_inputSet, dimension_after_random_mapping, dimension_before_random_mapping, input_set_size);

	/*----------------- Initialize the position table --------------------*/
	bool flag = true;
	int x = 0;
	int y = 0;
	for (int i = 0, t = 0; i < height; ++i)
	{
		//x = (i+1)/2;
		x = 0;
		for (int j = 0; j < 2 * width; ++j)
		{
			if (flag)
			{
				h_position[t] = x;
				flag = false;
				++x;
				++t;
			}
			else
			{
				h_position[t] = y;
				flag = true;
				++t;
			}
		}
		y++;
	}

	/*----------------- Initialize the distance table --------------------*/
	h_distance[0] = 0;
	for (unsigned int i = 0, t = 1; i < neuron_number - 1; ++i)
	{
		for (unsigned int j = i + 1; j < neuron_number; ++j)
		{
			int dX = (h_position[2 * i] - h_position[2 * j]) * (h_position[2 * i] - h_position[2 * j]);
			int dY = (h_position[2 * i + 1] - h_position[2 * j + 1]) * (h_position[2 * i + 1] - h_position[2 * j + 1]);

			if (sgn<int>(dX) == sgn<int>(dY))
			{
				h_distance[t] = abs(dX + dY);
			}
			else
			{
				h_distance[t] = abs(dX) > abs(dY) ? abs(dX) : abs(dY);
			}

			h_distance[t] = h_distance[t] * h_distance[t];
			//h_distance[t] = dX + dY;
			++t;
		}
	}
	cudaMemcpy(d_distance, h_distance, distance_table_length * sizeof(float), cudaMemcpyHostToDevice);

	/*-----------Initialize the weights of each neuron---------------------*/
	cudaMemcpy(d_weights, h_initial_weight, neuron_number* dimension_after_random_mapping * sizeof(float), cudaMemcpyHostToDevice);

	/*-----------Initialize the d_BID of each input vector---------------------*/
	cudaMemcpy(d_BID, h_BID, d_input_set_size * sizeof(unsigned int), cudaMemcpyHostToDevice);

	//Let's begin SOM
	float sigmaT = 2.0 ;
	Update_Map(d_distance, neuron_number, d_input_set, 0, d_BID, batch_size, dimension_after_random_mapping, sigmaT, d_weights);

	/*---------------Output -----------------*/
	float* h_output = new float[dimension_after_random_mapping*neuron_number];
	//Copy the final weights
	cudaMemcpy(h_output, d_weights, dimension_after_random_mapping*neuron_number*sizeof(float), cudaMemcpyDeviceToHost);

	/*--------------- check the result of final weights update -----------------*/
	std::ofstream fweightout("D:\\SOMLog\\weights_in_columnmajor");
	for (int i = 0; i < neuron_number; ++i)
	{
		for (int j = 0; j < dimension_after_random_mapping; j++)
		{
			fweightout << h_output[ i + j * neuron_number] << " ";
		}
		fweightout << std::endl;
	}
	fweightout.close();

	cudaFree(d_weights);
	cudaFree(d_input_set);
	cudaFree(d_BID);
	cudaFree(d_distance);
	delete[] h_position;
	delete[] h_distance;
	h_distance = NULL;
	h_position = NULL;

	return h_output;
}


unsigned int* FindBID(const float* h_gaussin,
					  const float* input_vector, 
					  const unsigned int input_vector_size, 
					  const unsigned int input_dimension,
					  const float* weights, 
					  const unsigned int weights_size)
{
	const unsigned int dimension_before_random_mapping = input_dimension;			//the original dimension of the input set
	const unsigned int dimension_after_random_mapping = DIMENSION;			//dimension after random mapping, can not change

	float* d_weights = 0;																//weights of each neuron in device memory
	float* d_input_set = 0;																//input set in device memory
	unsigned int* d_BID = 0;															//the id of best match neurons in device memory
	float* d_intermediate_result = 0;
	cudaMalloc((void**)&d_weights, dimension_after_random_mapping * weights_size * sizeof(float));
	cudaMalloc((void**)&d_BID, input_vector_size * sizeof(unsigned int));
	cudaMalloc((void**)&d_intermediate_result, input_vector_size * weights_size * sizeof(float));

	d_input_set = RandomMapping(h_gaussin, input_vector, dimension_after_random_mapping, dimension_before_random_mapping, input_vector_size);

	/*-----------Initialize the weights of each neuron---------------------*/
	cudaMemcpy(d_weights, weights, weights_size* dimension_after_random_mapping  * sizeof(float), cudaMemcpyHostToDevice);

	/*---------------------------Output----------------------------*/
	unsigned int* h_output = new unsigned int[input_vector_size * 2];
	float* d_error = 0;
	cudaMalloc((void**)&d_error, input_vector_size * sizeof(float));
	Output_BID_Error(d_weights, weights_size, d_input_set, 0, input_vector_size, d_BID, d_intermediate_result, d_error);
	cudaMemcpy(h_output , d_BID, input_vector_size*sizeof(unsigned int), cudaMemcpyDeviceToHost);
	cudaMemcpy(h_output + input_vector_size, d_error, input_vector_size*sizeof(float), cudaMemcpyDeviceToHost);

	cudaFree(d_weights);
	cudaFree(d_input_set);
	cudaFree(d_BID);
	cudaFree(d_intermediate_result);
	cudaFree(d_error);
	return h_output;
}