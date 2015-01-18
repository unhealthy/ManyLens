var ManyLens;
(function (ManyLens) {
    var D3ChartObject = (function () {
        function D3ChartObject(element) {
            this._element = element;
        }
        D3ChartObject.prototype.render = function (any) {
        };
        return D3ChartObject;
    })();
    ManyLens.D3ChartObject = D3ChartObject;
})(ManyLens || (ManyLens = {}));
///<reference path = "../tsScripts/D3ChartObject.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var ManyLens;
(function (ManyLens) {
    var TweetsCurve;
    (function (TweetsCurve) {
        var Curve = (function (_super) {
            __extends(Curve, _super);
            function Curve(element) {
                _super.call(this, element);
                this._x = d3.scale.linear();
                this._y = d3.scale.linear();
                this._x_axis_gen = d3.svg.axis();
                this._y_axis_gen = d3.svg.axis();
                this._section_num = 80;
                this._view_height = 150;
                this._view_width = screen.width;
                this._view_top_padding = 15;
                this._view_botton_padding = 20;
                this._view_left_padding = 50;
                this._view_right_padding = 50;
                this._x.range([this._view_left_padding, this._view_width - this._view_right_padding]).domain([0, this._section_num]);
                this._y.range([this._view_height - this._view_botton_padding, this._view_top_padding]).domain([0, 20]);
                this._x_axis_gen.scale(this._x).ticks(this._section_num).orient("bottom");
                this._y_axis_gen.scale(this._y).ticks(2).orient("left");
            }
            Object.defineProperty(Curve.prototype, "Section_Num", {
                get: function () {
                    return this._section_num;
                },
                set: function (num) {
                    if (typeof num === 'number') {
                        this._section_num = Math.ceil(num);
                    }
                },
                enumerable: true,
                configurable: true
            });
            Curve.prototype.render = function (data) {
                _super.prototype.render.call(this, data);
                var coordinate_view_width = this._view_width - this._view_left_padding - this._view_right_padding;
                var coordinate_view_height = this._view_height - this._view_top_padding - this._view_botton_padding;
                var svg = this._element.append("svg").attr("width", this._view_width).attr("height", this._view_height);
                svg.append("defs").append("clipPath").attr("id", "clip").append("rect").attr("width", coordinate_view_width).attr("height", coordinate_view_height).attr("x", this._view_left_padding).attr("y", this._view_top_padding);
                var xAxis = svg.append("g").attr("class", "x axis").attr("transform", "translate(0," + (this._view_height - this._view_botton_padding) + ")").call(this._x_axis_gen);
                var yAxis = svg.append("g").attr("class", "y axis").attr("transform", "translate(" + this._view_left_padding + ",0)").call(this._y_axis_gen);
                svg.append("g").attr("clip-path", "url(#clip)").append("g").attr("id", "mainView").append("path").attr('stroke', 'blue').attr('stroke-width', 2).attr('fill', 'none').attr("id", "path");
            };
            return Curve;
        })(ManyLens.D3ChartObject);
        TweetsCurve.Curve = Curve;
    })(TweetsCurve = ManyLens.TweetsCurve || (ManyLens.TweetsCurve = {}));
})(ManyLens || (ManyLens = {}));
///<reference path = "../Scripts/typings/d3/d3.d.ts" />
///<reference path = "../tsScripts/Cruve.ts" />
"use strict";
var manyLens;
document.addEventListener('DOMContentLoaded', function () {
    manyLens = new ManyLens.ManyLens();
});
///<reference path = "../tsScripts/D3ChartObject.ts" />
var ManyLens;
(function (ManyLens) {
    var Lens;
    (function (Lens) {
        var BaseD3Lens = (function (_super) {
            __extends(BaseD3Lens, _super);
            function BaseD3Lens(element, type, manyLens) {
                _super.call(this, element);
                this._is_composite_lens = false;
                this._lc_radius = 100;
                this._lc_scale = 1;
                this._lc_zoom = d3.behavior.zoom();
                this._lc_drag = d3.behavior.drag();
                this._sc_radius = 0;
                this._sc_cx = 0;
                this._sc_cy = 0;
                this._sc_scale = 1;
                this._manyLens = manyLens;
                this._type = type;
            }
            Object.defineProperty(BaseD3Lens.prototype, "ID", {
                get: function () {
                    return this._id;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(BaseD3Lens.prototype, "Type", {
                get: function () {
                    return this._type;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(BaseD3Lens.prototype, "LensTypeColor", {
                get: function () {
                    return this._lens_type_color;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(BaseD3Lens.prototype, "LensCX", {
                get: function () {
                    return this._lc_cx;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(BaseD3Lens.prototype, "LensCY", {
                get: function () {
                    return this._lc_cy;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(BaseD3Lens.prototype, "LensGroup", {
                get: function () {
                    return this._lens_circle_G;
                },
                set: function (lensG) {
                    this._lens_circle_G = lensG;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(BaseD3Lens.prototype, "IsCompositeLens", {
                get: function () {
                    return this._is_composite_lens;
                },
                enumerable: true,
                configurable: true
            });
            BaseD3Lens.prototype.extractData = function (any) {
                if (any === void 0) { any = null; }
                throw new Error('This method is abstract');
            };
            BaseD3Lens.prototype.showLens = function (any, lc_cx, lc_cy) {
                var _this = this;
                if (any === void 0) { any = null; }
                if (lc_cx === void 0) { lc_cx = null; }
                if (lc_cy === void 0) { lc_cy = null; }
                this._lc_zoom.scaleExtent([1, 2]).on("zoom", function () {
                    _this.LensCircleZoomFunc();
                });
                this._lc_drag.origin(function (d) {
                    return d;
                }).on("dragstart", function () {
                    _this.LensCircleDragstartFunc();
                }).on("drag", function () {
                    _this.LensCircleDragFunc();
                }).on("dragend", function () {
                    _this.LensCircleDragendFunc();
                });
                this._lens_circle_G = this._sc_lc_svg.append("g").data([{ x: this._lc_cx, y: this._lc_cy }]).attr("id", "lens_" + this._manyLens.LensCount).attr("class", "lens-circle-g " + this._type).attr("transform", "translate(" + [this._lc_cx, this._lc_cy] + ")scale(" + this._lc_scale + ")").attr("opacity", "1e-6").on("contextmenu", function () {
                    //d3.event.preventDefault();
                }).on("mousedown", function () {
                    console.log("mousedown " + _this._type);
                }).on("mouseup", function () {
                    console.log("mouseup " + _this._type);
                }).on("click", function () {
                    console.log("click " + _this._type);
                }).call(this._lc_zoom).call(this._lc_drag);
                this._lens_circle = this._lens_circle_G.append("circle").attr("class", "lens-circle").attr("cx", 0).attr("cy", 0).attr("r", this._lc_radius).attr("fill", "#fff").attr("stroke", "black").attr("stroke-width", 1);
                //re-order the line, select-circle and lens-circle
                //var tempChildren = d3.selectAll(this._sc_lc_svg[0][0].children);
                //var tt = tempChildren[0][0];
                //tempChildren[0][0] = tempChildren[0][1];
                //tempChildren[0][1] = tt;
                //tempChildren.order();
                //Add this lens to the app class
                this._manyLens.AddLens(this);
                return {
                    lcx: 0,
                    lcy: 0,
                    duration: 0
                };
            };
            BaseD3Lens.prototype.LensCircleDragstartFunc = function () {
                var tempGs = d3.select("#mapView").selectAll("svg > g");
                var index = tempGs[0].indexOf(this._sc_lc_svg[0][0]);
                tempGs[0].splice(index, 1);
                tempGs[0].push(this._sc_lc_svg[0][0]);
                tempGs.order();
            };
            BaseD3Lens.prototype.LensCircleDragFunc = function () {
                var _this = this;
                var transform = this._lens_circle_G.attr("transform");
                this._lens_circle_G.attr("transform", function (d) {
                    _this._lc_cx = d.x = Math.max(_this._lc_radius, Math.min(parseFloat(_this._element.style("width")) - _this._lc_radius, d3.event.x));
                    _this._lc_cy = d.y = Math.max(_this._lc_radius, Math.min(parseFloat(_this._element.style("height")) - _this._lc_radius, d3.event.y));
                    transform = transform.replace(/(translate\()\-?\d+\.?\d*,\-?\d+\.?\d*(\))/, "$1" + d.x + "," + d.y + "$2");
                    return transform;
                });
                var theta = Math.atan((this._lc_cy - this._sc_cy) / (this._lc_cx - this._sc_cx));
                var cosTheta = this._lc_cx > this._sc_cx ? Math.cos(theta) : -Math.cos(theta);
                var sinTheta = this._lc_cx > this._sc_cx ? Math.sin(theta) : -Math.sin(theta);
                this._sc_lc_svg.select("line").attr("x1", this._sc_cx + this._sc_radius * this._sc_scale * cosTheta).attr("y1", this._sc_cy + this._sc_radius * this._sc_scale * sinTheta).attr("x2", this._lc_cx - this._lc_radius * this._lc_scale * cosTheta).attr("y2", this._lc_cy - this._lc_radius * this._lc_scale * sinTheta);
            };
            BaseD3Lens.prototype.LensCircleDragendFunc = function () {
                var res = [];
                var eles = [];
                var x = d3.event.sourceEvent.x, y = d3.event.sourceEvent.y;
                var ele = d3.select(document.elementFromPoint(x, y));
                while (ele && ele.attr("id") != "mapSvg") {
                    if (ele.attr("class") == "lens-circle")
                        res.push(ele[0][0]);
                    eles.push(ele);
                    ele.style("visibility", "hidden");
                    ele = d3.select(document.elementFromPoint(x, y));
                }
                for (var i = 0; i < eles.length; i++) {
                    eles[i].style("visibility", "visible");
                }
                if (res.length == 2) {
                    var lensA_id = d3.select(res[0].parentNode).attr("id");
                    var lensB_id = d3.select(res[1].parentNode).attr("id");
                    var lensC = new Lens.BaseCompositeLens(this._element, this._manyLens.GetLens(lensA_id), this._manyLens.GetLens(lensB_id), this._manyLens);
                    if (lensC.isSuccess) {
                        console.log("Base Lens add lens");
                        lensC.render(lensC.extractData());
                    }
                }
                return res;
            };
            BaseD3Lens.prototype.LensCircleZoomFunc = function () {
                if (d3.event.sourceEvent.type != "wheel") {
                    return;
                }
                if (d3.event.scale == this._lc_scale) {
                    return;
                }
                if (d3.event.scale == this._lc_scale) {
                    return;
                }
                var scale = this._lc_scale = d3.event.scale;
                this._lens_circle_G.attr("transform", function () {
                    var transform = d3.select(this).attr("transform");
                    transform = transform.replace(/(scale\()\d+\.?\d*(\))/, "$1" + scale + "$2");
                    return transform;
                });
                var theta = Math.atan((this._lc_cy - this._sc_cy) / (this._lc_cx - this._sc_cx));
                var cosTheta = this._lc_cx > this._sc_cx ? Math.cos(theta) : -Math.cos(theta);
                var sinTheta = this._lc_cx > this._sc_cx ? Math.sin(theta) : -Math.sin(theta);
                this._sc_lc_svg.select("line").attr("x1", this._sc_cx + this._sc_radius * this._sc_scale * cosTheta).attr("y1", this._sc_cy + this._sc_radius * this._sc_scale * sinTheta).attr("x2", this._lc_cx - this._lc_radius * this._lc_scale * cosTheta).attr("y2", this._lc_cy - this._lc_radius * this._lc_scale * sinTheta);
            };
            BaseD3Lens.prototype.HideLens = function () {
                this._lens_circle_G.style("visibility", "hidden");
            };
            BaseD3Lens.prototype.ShowLens = function () {
                this._lens_circle_G.style("visibility", "visible");
            };
            return BaseD3Lens;
        })(ManyLens.D3ChartObject);
        Lens.BaseD3Lens = BaseD3Lens;
    })(Lens = ManyLens.Lens || (ManyLens.Lens = {}));
})(ManyLens || (ManyLens = {}));
///<reference path = "../tsScripts/BaseD3Lens.ts" />
var ManyLens;
(function (ManyLens) {
    var Lens;
    (function (Lens) {
        var BaseSingleLens = (function (_super) {
            __extends(BaseSingleLens, _super);
            function BaseSingleLens(element, type, manyLens) {
                _super.call(this, element, type, manyLens);
                this._has_put_down = false;
                this._has_showed_lens = false;
                this._sc_zoom = d3.behavior.zoom();
                this._sc_drag = d3.behavior.drag();
                this._sc_radius = 10;
            }
            BaseSingleLens.prototype.render = function (color) {
                var _this = this;
                var container = this._element;
                var hasShow = false;
                this._lens_type_color = color;
                this._sc_lc_svg = container.append("g").attr("class", "lens");
                this._sc_zoom.scaleExtent([1, 4]).on("zoom", function () {
                    _this.SelectCircleZoomFunc();
                });
                this._sc_drag.origin(function (d) {
                    return d;
                }).on("dragstart", function () {
                    //if (!this._has_put_down) return;
                    //if (d3.event.sourceEvent.button != 0) return;
                }).on("drag", function () {
                    _this.SelectCircleDragFunc();
                }).on("dragend", function (d) {
                    _this.SelectCircleDragendFunc(d);
                });
                this._sc_lc_svg.append("line").attr("stoke-width", 2).attr("stroke", "red");
                this._select_circle_G = this._sc_lc_svg.append("g").attr("class", "select-circle");
                var selectCircle = this._select_circle = this._select_circle_G.append("circle").data([{ x: this._sc_cx, y: this._sc_cy }]);
                selectCircle.attr("r", this._sc_radius).attr("fill", color).attr("fill-opacity", 0.7).attr("stroke", "black").attr("stroke-width", 1).on("mouseup", function (d) {
                    if (!_this._has_put_down) {
                        _this._has_put_down = true;
                        d.x = _this._sc_cx = parseFloat(selectCircle.attr("cx"));
                        d.y = _this._sc_cy = parseFloat(selectCircle.attr("cy"));
                        container.on("mousemove", null);
                    }
                }).on("contextmenu", function () {
                    _this._sc_lc_svg.remove();
                    d3.event.preventDefault();
                }).call(this._sc_zoom).call(this._sc_drag);
                container.on("mousemove", moveSelectCircle); //因为鼠标是在大SVG里移动，所以要绑定到大SVG上
                function moveSelectCircle() {
                    var p = d3.mouse(container[0][0]);
                    selectCircle.attr("cx", p[0]).attr("cy", p[1]);
                }
            };
            BaseSingleLens.prototype.showLens = function (any) {
                if (any === void 0) { any = null; }
                var duration = 300;
                var sc_lc_dist = 100;
                var theta = Math.random() * Math.PI;
                var cosTheta = Math.cos(theta);
                var sinTheta = Math.sin(theta);
                var cx = this._sc_cx + (this._sc_radius * cosTheta * this._sc_scale);
                var cy = this._sc_cy + (this._sc_radius * sinTheta * this._sc_scale);
                this._sc_lc_svg.select("line").attr("x1", cx).attr("y1", cy).attr("x2", cx).attr("y2", cy).attr("stoke-width", 2).attr("stroke", "red").transition().duration(duration).attr("x2", function () {
                    cx = cx + (sc_lc_dist * cosTheta);
                    return cx;
                }).attr("y2", function () {
                    cy = cy + (sc_lc_dist * sinTheta);
                    return cy;
                });
                this._lc_cx = cx + (this._lc_radius * cosTheta);
                this._lc_cy = cy + (this._lc_radius * sinTheta);
                _super.prototype.showLens.call(this);
                return {
                    lcx: this._lc_cx,
                    lcy: this._lc_cy,
                    duration: duration
                };
            };
            BaseSingleLens.prototype.SelectCircleDragFunc = function () {
                var _this = this;
                if (!this._has_put_down)
                    return;
                if (d3.event.sourceEvent.button != 0)
                    return;
                this._sc_lc_svg.select("g.lens-circle-g").remove();
                this._sc_lc_svg.select("line").attr("x1", 0).attr("x2", 0).attr("y1", 0).attr("y2", 0);
                this._select_circle.attr("cx", function (d) {
                    return d.x = Math.max(0, Math.min(parseFloat(_this._element.style("width")), d3.event.x));
                }).attr("cy", function (d) {
                    return d.y = Math.max(0, Math.min(parseFloat(_this._element.style("height")), d3.event.y));
                });
                this._has_showed_lens = false;
            };
            BaseSingleLens.prototype.SelectCircleDragendFunc = function (selectCircle) {
                if (!this._has_put_down)
                    return;
                if (d3.event.sourceEvent.button != 0)
                    return;
                this._sc_cx = selectCircle.x;
                this._sc_cy = selectCircle.y;
                //传递数据给Lens显示
                var data = this.extractData();
                if (!this._has_showed_lens) {
                    this.showLens(data);
                    this._has_showed_lens = true;
                }
                //z-index的问题先不解决
                ////re-order the g elements so the paneG could on the toppest
                //var tempGs = d3.select("#mapView").selectAll("svg > g");
                //tempGs[0].splice(tempGs[0].length - 2, 0, tempGs[0].pop());
                //tempGs.order();
            };
            BaseSingleLens.prototype.SelectCircleZoomFunc = function () {
                if (d3.event.sourceEvent.type != "wheel") {
                    return;
                }
                if (d3.event.scale == this._sc_scale) {
                    return;
                }
                if (d3.event.scale == this._sc_scale) {
                    return;
                }
                this._sc_scale = d3.event.scale;
                var theta = Math.atan((this._lc_cy - this._sc_cy) / (this._lc_cx - this._sc_cx));
                var cosTheta = this._lc_cx > this._sc_cx ? Math.cos(theta) : -Math.cos(theta);
                var sinTheta = this._lc_cx > this._sc_cx ? Math.sin(theta) : -Math.sin(theta);
                this._select_circle.attr("r", this._sc_radius * this._sc_scale);
                this._sc_lc_svg.select("line").attr("x1", this._sc_cx + this._sc_radius * d3.event.scale * cosTheta).attr("y1", this._sc_cy + this._sc_radius * d3.event.scale * sinTheta);
            };
            return BaseSingleLens;
        })(Lens.BaseD3Lens);
        Lens.BaseSingleLens = BaseSingleLens;
    })(Lens = ManyLens.Lens || (ManyLens.Lens = {}));
})(ManyLens || (ManyLens = {}));
///<reference path = "../tsScripts/BaseSingleLens.ts" />
var ManyLens;
(function (ManyLens) {
    var Lens;
    (function (Lens) {
        var BarChartLens = (function (_super) {
            __extends(BarChartLens, _super);
            function BarChartLens(element, manyLens) {
                _super.call(this, element, "BarChartLens", manyLens);
                this._x_axis_gen = d3.svg.axis();
                this._bar_chart_width = this._lc_radius * Math.SQRT2;
                this._bar_chart_height = this._bar_chart_width;
            }
            BarChartLens.prototype.render = function (color) {
                _super.prototype.render.call(this, color);
            };
            BarChartLens.prototype.extractData = function () {
                var data;
                data = d3.range(12).map(function (d) {
                    return 10 + 70 * Math.random();
                });
                return data;
            };
            BarChartLens.prototype.showLens = function (data, lc_cx, lc_cy) {
                var _this = this;
                if (lc_cx === void 0) { lc_cx = null; }
                if (lc_cy === void 0) { lc_cy = null; }
                var p = _super.prototype.showLens.call(this, null);
                var container = this._element;
                var lensG = this._lens_circle_G;
                var x = d3.scale.linear().range([0, this._bar_chart_width]).domain([0, data.length]);
                this._x_axis_gen.scale(x).ticks(0).orient("bottom");
                this._x_axis = lensG.append("g").attr("class", "x-axis").attr("transform", function () {
                    return "translate(" + [-_this._bar_chart_width / 2, _this._bar_chart_height / 2] + ")";
                }).attr("fill", "none").attr("stroke", "black").attr("stroke-width", 1).call(this._x_axis_gen);
                this._bar_width = (this._bar_chart_width - 20) / data.length;
                var barHeight = d3.scale.linear().range([10, this._bar_chart_height]).domain(d3.extent(data));
                var bar = lensG.selectAll(".bar").data(data).enter().append("g").attr("transform", function (d, i) {
                    return "translate(" + [10 + i * _this._bar_width - _this._bar_chart_width / 2, _this._bar_chart_height / 2 - barHeight(d)] + ")";
                });
                bar.append("rect").attr("width", this._bar_width).attr("height", function (d) {
                    return barHeight(d);
                }).attr("fill", "steelblue");
                lensG.transition().duration(p.duration).attr("opacity", "1");
            };
            return BarChartLens;
        })(Lens.BaseSingleLens);
        Lens.BarChartLens = BarChartLens;
    })(Lens = ManyLens.Lens || (ManyLens.Lens = {}));
})(ManyLens || (ManyLens = {}));
var ManyLens;
(function (ManyLens) {
    var Lens;
    (function (Lens) {
        var BaseCompositeLens = (function (_super) {
            __extends(BaseCompositeLens, _super);
            function BaseCompositeLens(element, firstLens, secondLens, manyLens) {
                _super.call(this, element, "", manyLens);
                this.IsCompositeLens = true;
                this._success = false;
                this._manyLens = manyLens;
                this._lens = new Array();
                this._lens.push(firstLens);
                this._lens.push(secondLens);
                this._lc_cx = firstLens.LensCX;
                this._lc_cy = firstLens.LensCY;
                this._success = true;
            }
            Object.defineProperty(BaseCompositeLens.prototype, "ID", {
                get: function () {
                    return this._id;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(BaseCompositeLens.prototype, "Type", {
                get: function () {
                    return this._type;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(BaseCompositeLens.prototype, "isSuccess", {
                get: function () {
                    return this._success;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(BaseCompositeLens.prototype, "LensTypeColor", {
                get: function () {
                    return this._lens_type_color;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(BaseCompositeLens.prototype, "LensCX", {
                get: function () {
                    return this._lc_cx;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(BaseCompositeLens.prototype, "LensCY", {
                get: function () {
                    return this._lc_cy;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(BaseCompositeLens.prototype, "LensGroup", {
                get: function () {
                    return this._lens_circle_G;
                },
                set: function (lensG) {
                    this._lens_circle_G = lensG;
                },
                enumerable: true,
                configurable: true
            });
            BaseCompositeLens.prototype.render = function (data) {
                this._sc_lc_svg = this._element.append("g").attr("class", "lens");
                var bl = new Lens.BoundleLens(this._element, this._manyLens);
                bl.showLens(bl.testExtractData(), this._lc_cx, this._lc_cy);
                this._lens.forEach(function (d) {
                    d.LensGroup = bl.LensGroup;
                    console.log(d);
                });
            };
            BaseCompositeLens.prototype.showLens = function (any) {
                if (any === void 0) { any = null; }
                return _super.prototype.showLens.call(this);
            };
            BaseCompositeLens.prototype.extractData = function () {
                var data = new Array();
                return data;
            };
            return BaseCompositeLens;
        })(Lens.BaseD3Lens);
        Lens.BaseCompositeLens = BaseCompositeLens;
    })(Lens = ManyLens.Lens || (ManyLens.Lens = {}));
})(ManyLens || (ManyLens = {}));
///<reference path = "../tsScripts/D3ChartObject.ts" />
var ManyLens;
(function (ManyLens) {
    var Pane;
    (function (Pane) {
        var BlossomLensPane = (function (_super) {
            __extends(BlossomLensPane, _super);
            function BlossomLensPane(element, manyLens) {
                _super.call(this, element);
                //private _lens: Array<Lens.BaseD3Lens> = new Array<Lens.BaseD3Lens>();
                this._pane_radius = 100;
                this._pane_arc = d3.svg.arc();
                this._pane_pie = d3.layout.pie();
                this._pane_color = d3.scale.category20();
                this._current_pane_g = null;
                this._lens_count = 2;
                this._manyLens = manyLens;
                this._pane_pie.startAngle(-Math.PI / 2).endAngle(Math.PI / 2).value(function () {
                    return 1;
                });
                this._pane_arc.innerRadius(this._pane_radius - 40).outerRadius(this._pane_radius);
            }
            BlossomLensPane.prototype.render = function () {
                var _this = this;
                var container = this._element;
                container.on("click", function () {
                    _this.openPane();
                });
            };
            BlossomLensPane.prototype.openPane = function () {
                var _this = this;
                if (this._current_pane_g && this._current_pane_g.isOpened) {
                    (function () {
                        _this.closePane("click close");
                    })();
                }
                var p = d3.mouse(this._element[0][0]);
                var timer = setTimeout(function () {
                    _this.closePane("time out close");
                }, 2000);
                var svg = this._element.append("g").attr("transform", "translate(" + p[0] + "," + p[1] + ")");
                svg.selectAll("circle").data(this._pane_pie([1, 1, 1, 1, 1])).enter().append("circle").attr("class", "pane-Lens-Circle").attr("id", function (d, i) {
                    return "lens" + i;
                }).style("fill", function (d, i) {
                    return _this._pane_color(i);
                }).attr("r", 10).on("mouseover", function () {
                    clearTimeout(_this._current_pane_g.timer);
                }).on("mouseout", function () {
                    _this._current_pane_g.timer = setTimeout(function () {
                        _this.closePane("time out close");
                    }, 1000);
                }).on("click", function (d, i) {
                    var len;
                    switch (i) {
                        case 0:
                            {
                                len = new ManyLens.Lens.BarChartLens(_this._element, _this._manyLens);
                                break;
                            }
                        case 1:
                            {
                                len = new ManyLens.Lens.LocationLens(_this._element, _this._manyLens);
                                break;
                            }
                        case 2:
                            {
                                len = new ManyLens.Lens.NetworkLens(_this._element, _this._manyLens);
                                break;
                            }
                        case 3:
                            {
                                len = new ManyLens.Lens.PieChartLens(_this._element, _this._manyLens);
                                break;
                            }
                        case 4:
                            {
                                len = new ManyLens.Lens.WordCloudLens(_this._element, _this._manyLens);
                                break;
                            }
                    }
                    //this._lens.push(len);
                    len.render(_this._pane_color(i));
                    //this._history_trees.addNode({ color: this._pane_color(i), lensType: len.Type, tree_id: 0 });
                    d3.event.stopPropagation();
                    _this.closePane("select a lens");
                }).transition().duration(750).attr("transform", function (d) {
                    return "translate(" + _this._pane_arc.centroid(d) + ")";
                });
                this._current_pane_g = { svg_g: svg, timer: timer, isOpened: true };
            };
            BlossomLensPane.prototype.closePane = function (msg) {
                console.log(msg);
                var t = 400;
                var closeG = this._current_pane_g;
                clearTimeout(closeG.timer);
                closeG.isOpened = false;
                closeG.svg_g.selectAll(".paneCircle").transition().duration(t).attr("transform", "translate(0)").remove();
                setTimeout(function () {
                    closeG.svg_g.remove();
                }, t);
            };
            return BlossomLensPane;
        })(ManyLens.D3ChartObject);
        Pane.BlossomLensPane = BlossomLensPane;
    })(Pane = ManyLens.Pane || (ManyLens.Pane = {}));
})(ManyLens || (ManyLens = {}));
///<reference path = "../tsScripts/BaseSingleLens.ts" />
var ManyLens;
(function (ManyLens) {
    var Lens;
    (function (Lens) {
        var BoundleLens = (function (_super) {
            __extends(BoundleLens, _super);
            function BoundleLens(element, manyLens) {
                _super.call(this, element, "BoundleLens", manyLens);
                this._innerRadius = this._lc_radius - 0;
                this._cluster = d3.layout.cluster();
                this._boundle = d3.layout.bundle();
                this._line = d3.svg.line.radial();
                this._cluster.size([360, this._innerRadius]).sort(null).value(function (d) {
                    return d.size;
                });
                this._line.interpolate("bundle").tension(.85).radius(function (d) {
                    return d.y;
                }).angle(function (d) {
                    return d.x / 180 * Math.PI;
                });
            }
            BoundleLens.prototype.render = function (color) {
                _super.prototype.render.call(this, color);
            };
            BoundleLens.prototype.extractData = function () {
                var data = [
                    { "name": "flare.util.palette.ShapePalette", "size": 2059, "imports": ["flare.util.palette.Palette", "flare.util.Shapes"] },
                    { "name": "flare.util.palette.SizePalette", "size": 2291, "imports": ["flare.util.palette.Palette"] },
                    { "name": "flare.util.Property", "size": 5559, "imports": ["flare.util.IPredicate", "flare.util.IValueProxy", "flare.util.IEvaluable"] },
                    { "name": "flare.util.Shapes", "size": 19118, "imports": ["flare.util.Arrays"] },
                    { "name": "flare.util.Sort", "size": 6887, "imports": ["flare.util.Arrays", "flare.util.Property"] },
                    { "name": "flare.util.Stats", "size": 6557, "imports": ["flare.util.Arrays", "flare.util.Property"] },
                    { "name": "flare.util.Strings", "size": 22026, "imports": ["flare.util.Dates", "flare.util.Property"] },
                    { "name": "flare.vis.axis.Axes", "size": 1302, "imports": ["flare.animate.Transitioner", "flare.vis.Visualization"] },
                    { "name": "flare.vis.axis.Axis", "size": 24593, "imports": ["flare.animate.Transitioner", "flare.scale.LinearScale", "flare.util.Arrays", "flare.scale.ScaleType", "flare.util.Strings", "flare.display.TextSprite", "flare.scale.Scale", "flare.util.Stats", "flare.scale.IScaleMap", "flare.vis.axis.AxisLabel", "flare.vis.axis.AxisGridLine"] },
                    { "name": "flare.vis.axis.AxisGridLine", "size": 652, "imports": ["flare.vis.axis.Axis", "flare.display.LineSprite"] },
                    { "name": "flare.vis.axis.AxisLabel", "size": 636, "imports": ["flare.vis.axis.Axis", "flare.display.TextSprite"] },
                    { "name": "flare.vis.axis.CartesianAxes", "size": 6703, "imports": ["flare.animate.Transitioner", "flare.display.RectSprite", "flare.vis.axis.Axis", "flare.display.TextSprite", "flare.vis.axis.Axes", "flare.vis.Visualization", "flare.vis.axis.AxisGridLine"] },
                    { "name": "flare.vis.controls.AnchorControl", "size": 2138, "imports": ["flare.vis.controls.Control", "flare.vis.Visualization", "flare.vis.operator.layout.Layout"] },
                    { "name": "flare.vis.controls.ClickControl", "size": 3824, "imports": ["flare.vis.events.SelectionEvent", "flare.vis.controls.Control"] },
                    { "name": "flare.vis.controls.Control", "size": 1353, "imports": ["flare.vis.controls.IControl", "flare.util.Filter"] },
                    { "name": "flare.vis.controls.ControlList", "size": 4665, "imports": ["flare.vis.controls.IControl", "flare.util.Arrays", "flare.vis.Visualization", "flare.vis.controls.Control"] },
                    { "name": "flare.vis.controls.DragControl", "size": 2649, "imports": ["flare.vis.controls.Control", "flare.vis.data.DataSprite"] },
                    { "name": "flare.vis.controls.ExpandControl", "size": 2832, "imports": ["flare.animate.Transitioner", "flare.vis.data.NodeSprite", "flare.vis.controls.Control", "flare.vis.Visualization"] },
                    { "name": "flare.vis.controls.HoverControl", "size": 4896, "imports": ["flare.vis.events.SelectionEvent", "flare.vis.controls.Control"] },
                    { "name": "flare.vis.controls.IControl", "size": 763, "imports": ["flare.vis.controls.Control"] },
                    { "name": "flare.vis.controls.PanZoomControl", "size": 5222, "imports": ["flare.util.Displays", "flare.vis.controls.Control"] },
                    { "name": "flare.vis.controls.SelectionControl", "size": 7862, "imports": ["flare.vis.events.SelectionEvent", "flare.vis.controls.Control"] },
                    { "name": "flare.vis.controls.TooltipControl", "size": 8435, "imports": ["flare.animate.Tween", "flare.display.TextSprite", "flare.vis.controls.Control", "flare.vis.events.TooltipEvent"] },
                    { "name": "flare.vis.data.Data", "size": 20544, "imports": ["flare.vis.data.EdgeSprite", "flare.vis.data.NodeSprite", "flare.util.Arrays", "flare.vis.data.DataSprite", "flare.vis.data.Tree", "flare.vis.events.DataEvent", "flare.data.DataSet", "flare.vis.data.TreeBuilder", "flare.vis.data.DataList", "flare.data.DataSchema", "flare.util.Sort", "flare.data.DataField", "flare.util.Property"] },
                    { "name": "flare.vis.data.DataList", "size": 19788, "imports": ["flare.animate.Transitioner", "flare.vis.data.NodeSprite", "flare.util.Arrays", "flare.util.math.DenseMatrix", "flare.vis.data.DataSprite", "flare.vis.data.EdgeSprite", "flare.vis.events.DataEvent", "flare.util.Stats", "flare.util.math.IMatrix", "flare.util.Sort", "flare.util.Filter", "flare.util.Property", "flare.util.IEvaluable", "flare.vis.data.Data"] },
                    { "name": "flare.vis.data.DataSprite", "size": 10349, "imports": ["flare.util.Colors", "flare.vis.data.Data", "flare.display.DirtySprite", "flare.vis.data.render.IRenderer", "flare.vis.data.render.ShapeRenderer"] },
                    { "name": "flare.vis.data.EdgeSprite", "size": 3301, "imports": ["flare.vis.data.render.EdgeRenderer", "flare.vis.data.DataSprite", "flare.vis.data.NodeSprite", "flare.vis.data.render.ArrowType", "flare.vis.data.Data"] },
                    { "name": "flare.vis.data.NodeSprite", "size": 19382, "imports": ["flare.animate.Transitioner", "flare.util.Arrays", "flare.vis.data.DataSprite", "flare.vis.data.EdgeSprite", "flare.vis.data.Tree", "flare.util.Sort", "flare.util.Filter", "flare.util.IEvaluable", "flare.vis.data.Data"] },
                    { "name": "flare.vis.data.render.ArrowType", "size": 698, "imports": [] },
                    { "name": "flare.vis.data.render.EdgeRenderer", "size": 5569, "imports": ["flare.vis.data.EdgeSprite", "flare.vis.data.NodeSprite", "flare.vis.data.DataSprite", "flare.vis.data.render.IRenderer", "flare.util.Shapes", "flare.util.Geometry", "flare.vis.data.render.ArrowType"] },
                    { "name": "flare.vis.data.render.IRenderer", "size": 353, "imports": ["flare.vis.data.DataSprite"] },
                    { "name": "flare.vis.data.render.ShapeRenderer", "size": 2247, "imports": ["flare.util.Shapes", "flare.vis.data.render.IRenderer", "flare.vis.data.DataSprite"] },
                    { "name": "flare.vis.data.ScaleBinding", "size": 11275, "imports": ["flare.scale.TimeScale", "flare.scale.ScaleType", "flare.scale.LinearScale", "flare.scale.LogScale", "flare.scale.OrdinalScale", "flare.scale.RootScale", "flare.scale.Scale", "flare.scale.QuantileScale", "flare.util.Stats", "flare.scale.QuantitativeScale", "flare.vis.events.DataEvent", "flare.vis.data.Data"] },
                    { "name": "flare.vis.data.Tree", "size": 7147, "imports": ["flare.vis.data.EdgeSprite", "flare.vis.events.DataEvent", "flare.vis.data.NodeSprite", "flare.vis.data.Data"] },
                    { "name": "flare.vis.data.TreeBuilder", "size": 9930, "imports": ["flare.vis.data.EdgeSprite", "flare.vis.data.NodeSprite", "flare.vis.data.Tree", "flare.util.heap.HeapNode", "flare.util.heap.FibonacciHeap", "flare.util.Property", "flare.util.IEvaluable", "flare.vis.data.Data"] },
                    { "name": "flare.vis.events.DataEvent", "size": 2313, "imports": ["flare.vis.data.EdgeSprite", "flare.vis.data.NodeSprite", "flare.vis.data.DataList", "flare.vis.data.DataSprite"] },
                    { "name": "flare.vis.events.SelectionEvent", "size": 1880, "imports": ["flare.vis.events.DataEvent"] },
                    { "name": "flare.vis.operator.layout.IndentedTreeLayout", "size": 3174, "imports": ["flare.animate.Transitioner", "flare.vis.data.NodeSprite", "flare.util.Arrays", "flare.vis.operator.layout.Layout", "flare.vis.data.EdgeSprite"] },
                    { "name": "flare.vis.operator.layout.Layout", "size": 7881, "imports": ["flare.animate.Transitioner", "flare.vis.data.NodeSprite", "flare.vis.data.DataList", "flare.vis.data.DataSprite", "flare.vis.data.EdgeSprite", "flare.vis.Visualization", "flare.vis.axis.CartesianAxes", "flare.vis.axis.Axes", "flare.animate.TransitionEvent", "flare.vis.operator.Operator"] },
                    { "name": "flare.vis.operator.layout.NodeLinkTreeLayout", "size": 12870, "imports": ["flare.vis.data.NodeSprite", "flare.util.Arrays", "flare.util.Orientation", "flare.vis.operator.layout.Layout"] },
                    { "name": "flare.vis.operator.layout.PieLayout", "size": 2728, "imports": ["flare.vis.data.DataList", "flare.vis.data.DataSprite", "flare.util.Shapes", "flare.util.Property", "flare.vis.operator.layout.Layout", "flare.vis.data.Data"] },
                    { "name": "flare.vis.operator.layout.RadialTreeLayout", "size": 12348, "imports": ["flare.vis.data.NodeSprite", "flare.util.Arrays", "flare.vis.operator.layout.Layout"] },
                    { "name": "flare.vis.operator.layout.RandomLayout", "size": 870, "imports": ["flare.vis.operator.layout.Layout", "flare.vis.data.DataSprite", "flare.vis.data.Data"] },
                    { "name": "flare.vis.operator.layout.StackedAreaLayout", "size": 9121, "imports": ["flare.scale.TimeScale", "flare.scale.LinearScale", "flare.util.Arrays", "flare.scale.OrdinalScale", "flare.vis.data.NodeSprite", "flare.scale.Scale", "flare.vis.axis.CartesianAxes", "flare.util.Stats", "flare.util.Orientation", "flare.scale.QuantitativeScale", "flare.util.Maths", "flare.vis.operator.layout.Layout"] },
                    { "name": "flare.vis.operator.layout.TreeMapLayout", "size": 9191, "imports": ["flare.animate.Transitioner", "flare.vis.data.NodeSprite", "flare.util.Property", "flare.vis.operator.layout.Layout"] },
                    { "name": "flare.vis.operator.Operator", "size": 2490, "imports": ["flare.animate.Transitioner", "flare.vis.operator.IOperator", "flare.util.Property", "flare.util.IEvaluable", "flare.vis.Visualization"] },
                    { "name": "flare.vis.operator.OperatorList", "size": 5248, "imports": ["flare.animate.Transitioner", "flare.util.Arrays", "flare.vis.operator.IOperator", "flare.vis.Visualization", "flare.vis.operator.Operator"] },
                    { "name": "flare.vis.operator.OperatorSequence", "size": 4190, "imports": ["flare.animate.Transitioner", "flare.util.Arrays", "flare.vis.operator.IOperator", "flare.vis.operator.OperatorList", "flare.animate.FunctionSequence", "flare.vis.operator.Operator"] },
                    { "name": "flare.vis.operator.OperatorSwitch", "size": 2581, "imports": ["flare.animate.Transitioner", "flare.vis.operator.OperatorList", "flare.vis.operator.IOperator", "flare.vis.operator.Operator"] },
                    { "name": "flare.vis.operator.SortOperator", "size": 2023, "imports": ["flare.vis.operator.Operator", "flare.animate.Transitioner", "flare.util.Arrays", "flare.vis.data.Data"] },
                    { "name": "flare.vis.Visualization", "size": 16540, "imports": ["flare.animate.Transitioner", "flare.vis.operator.IOperator", "flare.animate.Scheduler", "flare.vis.events.VisualizationEvent", "flare.vis.data.Tree", "flare.vis.events.DataEvent", "flare.vis.axis.Axes", "flare.vis.axis.CartesianAxes", "flare.util.Displays", "flare.vis.operator.OperatorList", "flare.vis.controls.ControlList", "flare.animate.ISchedulable", "flare.vis.data.Data"] }
                ];
                return data;
            };
            BoundleLens.prototype.testExtractData = function () {
                return this.extractData();
            };
            BoundleLens.prototype.showLens = function (data, lc_cx, lc_cy) {
                if (lc_cx === void 0) { lc_cx = null; }
                if (lc_cy === void 0) { lc_cy = null; }
                var p = _super.prototype.showLens.call(this, null);
                var container = this._element;
                var lensG = this._lens_circle_G;
                var nodes = this._cluster.nodes(packageHierarchy(data)), links = packageImports(nodes);
                lensG.selectAll(".link").data(this._boundle(links)).enter().append("path").attr("class", "link").attr("d", this._line).attr("stroke", "steelblue").attr("stroke-opacity", ".4").attr("fill", "none");
                lensG.selectAll(".node").data(nodes.filter(function (n) {
                    return !n.children;
                })).enter().append("g").attr("class", "node").attr("transform", function (d) {
                    return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")";
                }).attr("font", '11px "Helvetica Neue", Helvetica, Arial, sans-serif').append("text").attr("dx", function (d) {
                    return d.x < 180 ? 8 : -8;
                }).attr("dy", ".31em").attr("text-anchor", function (d) {
                    return d.x < 180 ? "start" : "end";
                }).attr("transform", function (d) {
                    return d.x < 180 ? null : "rotate(180)";
                }).text(function (d) {
                    return d.key;
                });
                lensG.transition().duration(p.duration).attr("opacity", "1");
                function packageHierarchy(classes) {
                    var map = {};
                    function find(name, data) {
                        var node = map[name], i;
                        if (!node) {
                            node = map[name] = data || { name: name, children: [] };
                            if (name.length) {
                                node.parent = find(name.substring(0, i = name.lastIndexOf(".")), null);
                                node.parent.children.push(node);
                                node.key = name.substring(i + 1);
                            }
                        }
                        return node;
                    }
                    classes.forEach(function (d) {
                        find(d.name, d);
                    });
                    return map[""];
                }
                // Return a list of imports for the given array of nodes.
                function packageImports(nodes) {
                    var map = {}, imports = [];
                    // Compute a map from name to node.
                    nodes.forEach(function (d) {
                        map[d.name] = d;
                    });
                    // For each import, construct a link from the source to target node.
                    nodes.forEach(function (d) {
                        if (d.imports)
                            d.imports.forEach(function (i) {
                                var t = map[i];
                                if (t) {
                                    imports.push({ source: map[d.name], target: t });
                                }
                            });
                    });
                    return imports;
                }
            };
            return BoundleLens;
        })(Lens.BaseSingleLens);
        Lens.BoundleLens = BoundleLens;
    })(Lens = ManyLens.Lens || (ManyLens.Lens = {}));
})(ManyLens || (ManyLens = {}));
///<reference path = "../tsScripts/D3ChartObject.ts" />
var ManyLens;
(function (ManyLens) {
    var Pane;
    (function (Pane) {
        var ClassicLensPane = (function (_super) {
            __extends(ClassicLensPane, _super);
            function ClassicLensPane(element, manyLens) {
                var _this = this;
                _super.call(this, element);
                this._lens_count = 6;
                this._pane_color = d3.scale.category20();
                //private _history_trees: LensHistory.HistoryTrees;
                this._drag = d3.behavior.drag();
                this._manyLens = manyLens;
                this._drag.origin(function (d) {
                    return d;
                }).on("drag", function () {
                    _this.dragFunc();
                });
                var pane_icon_r = 10;
                var pane_icon_padding = 10;
                this._pang_g = {
                    svg_g: this._element.append("g"),
                    x: 10,
                    y: 10,
                    rect_height: (this._lens_count * pane_icon_r * 2) + (this._lens_count + 1) * pane_icon_padding,
                    rect_width: 2 * (pane_icon_r + pane_icon_padding),
                    lens_icon_r: pane_icon_r,
                    lens_icon_padding: pane_icon_padding,
                    lens_count: this._lens_count
                };
            }
            ClassicLensPane.prototype.render = function () {
                this.openPane();
            };
            ClassicLensPane.prototype.openPane = function () {
                var _this = this;
                var container = this._element;
                var pane_g = this._pang_g.svg_g.data([this._pang_g]).attr("class", "lensPane").attr("transform", "translate(" + [10, 10] + ")").call(this._drag);
                pane_g.append("rect").attr("x", 0).attr("y", 0).attr("width", this._pang_g.rect_width).attr("height", this._pang_g.rect_height).attr("fill", "#fff7bc").attr("stroke", "pink").attr("stroke-width", 2);
                pane_g.selectAll("circle").data(d3.range(this._lens_count)).enter().append("circle").attr("class", "pane-Lens-Circle").attr("r", this._pang_g.lens_icon_r).attr("cx", this._pang_g.rect_width / 2).attr("cy", function (d, i) {
                    return _this._pang_g.lens_icon_r + _this._pang_g.lens_icon_padding + i * (2 * _this._pang_g.lens_icon_r + _this._pang_g.lens_icon_padding);
                }).attr("fill", function (d, i) {
                    return _this._pane_color(i);
                }).on("mousedown", function () {
                    d3.event.stopPropagation();
                }).on("click", function (d, i) {
                    var len;
                    switch (i) {
                        case 0:
                            {
                                len = new ManyLens.Lens.NetworkLens(_this._element, _this._manyLens);
                                break;
                            }
                        case 1:
                            {
                                len = new ManyLens.Lens.WordCloudLens(_this._element, _this._manyLens);
                                break;
                            }
                        case 2:
                            {
                                len = new ManyLens.Lens.BarChartLens(_this._element, _this._manyLens);
                                break;
                            }
                        case 3:
                            {
                                len = new ManyLens.Lens.PieChartLens(_this._element, _this._manyLens);
                                break;
                            }
                        case 4:
                            {
                                len = new ManyLens.Lens.LocationLens(_this._element, _this._manyLens);
                                break;
                            }
                        case 5:
                            {
                                len = new ManyLens.Lens.BoundleLens(_this._element, _this._manyLens);
                                break;
                            }
                    }
                    len.render(_this._pane_color(i));
                    d3.event.stopPropagation();
                });
            };
            ClassicLensPane.prototype.closePane = function (msg) {
            };
            ClassicLensPane.prototype.dragFunc = function () {
                var pane_rect_width = this._pang_g.rect_width;
                var pane_rect_height = this._pang_g.rect_height;
                this._pang_g.svg_g.attr("transform", "translate(" + [
                    this._pang_g.x = Math.max(0, Math.min(parseFloat(this._element.style("width")) - pane_rect_width, d3.event.x)),
                    this._pang_g.y = Math.max(0, Math.min(parseFloat(this._element.style("height")) - pane_rect_height, d3.event.y))
                ] + ")");
            };
            return ClassicLensPane;
        })(ManyLens.D3ChartObject);
        Pane.ClassicLensPane = ClassicLensPane;
    })(Pane = ManyLens.Pane || (ManyLens.Pane = {}));
})(ManyLens || (ManyLens = {}));
var ManyLens;
(function (ManyLens) {
    var LensHistory;
    (function (LensHistory) {
        var HistoryTrees = (function (_super) {
            __extends(HistoryTrees, _super);
            function HistoryTrees(element) {
                _super.call(this, element);
                this._trees = [];
            }
            HistoryTrees.prototype.render = function () {
            };
            HistoryTrees.prototype.addTree = function () {
                var treeG = this._element.append("g").attr("id", this._trees.length).attr("class", "historyTree");
                var tree = {
                    id: this._trees.length,
                    tree_layout: d3.layout.tree().size([parseFloat(this._element.style("width")), parseFloat(this._element.style("height"))]),
                    tree_g: treeG,
                    root: { tree_id: this._trees.length, color: "black", lensType: null },
                    nodes: [],
                    node: treeG.selectAll(".node"),
                    link: treeG.selectAll(".link"),
                    diagonal: d3.svg.diagonal()
                };
                tree.tree_layout.nodes(tree.root);
                tree.root.parent = tree.root;
                tree.root.px = tree.root.x;
                tree.root.py = tree.root.y;
                tree.nodes.push(tree.root);
                this._trees.push(tree);
            };
            HistoryTrees.prototype.addNode = function (node) {
                var tree = this._trees[node.tree_id];
                node.id = tree.nodes.length;
                var p = tree.nodes[Math.random() * tree.nodes.length | 0];
                if (p.children)
                    p.children.push(node);
                else
                    p.children = [node];
                tree.nodes.push(node);
                tree.node = tree.node.data(tree.tree_layout.nodes(tree.root), function (d) {
                    return d.id;
                });
                tree.link = tree.link.data(tree.tree_layout.links(tree.nodes), function (d) {
                    return d.source.id + "-" + d.target.id;
                });
                // Add entering nodes in the parent’s old position.
                tree.node.enter().append("circle").attr("class", "node").attr("r", 10).attr("fill", node.color).attr("cx", function (d) {
                    return d.parent.px;
                }).attr("cy", function (d) {
                    return d.parent.py;
                });
                // Add entering links in the parent’s old position.
                tree.link.enter().insert("path", ".node").attr("class", "link").attr("stroke", "#000").attr("fill", "none").attr("d", function (d) {
                    var o = { x: d.source.px, y: d.source.py };
                    return tree.diagonal({ source: o, target: o });
                });
                // Transition nodes and links to their new positions.
                var t = tree.tree_g.transition().duration(500);
                t.selectAll(".link").attr("d", tree.diagonal);
                t.selectAll(".node").attr("cx", function (d) {
                    return d.px = d.x;
                }).attr("cy", function (d) {
                    return d.py = d.y;
                });
            };
            return HistoryTrees;
        })(ManyLens.D3ChartObject);
        LensHistory.HistoryTrees = HistoryTrees;
    })(LensHistory = ManyLens.LensHistory || (ManyLens.LensHistory = {}));
})(ManyLens || (ManyLens = {}));
///<reference path = "../tsScripts/BaseSingleLens.ts" />
var ManyLens;
(function (ManyLens) {
    var Lens;
    (function (Lens) {
        var LocationLens = (function (_super) {
            __extends(LocationLens, _super);
            function LocationLens(element, manyLens) {
                _super.call(this, element, "LocationLens", manyLens);
                this._map_width = this._lc_radius * Math.SQRT2;
                this._map_height = this._map_width;
                this._map_path = "./img/chinamap.svg";
            }
            LocationLens.prototype.render = function (color) {
                _super.prototype.render.call(this, color);
            };
            LocationLens.prototype.extractData = function () {
                var data;
                return data;
            };
            LocationLens.prototype.showLens = function (data, lc_cx, lc_cy) {
                if (lc_cx === void 0) { lc_cx = null; }
                if (lc_cy === void 0) { lc_cy = null; }
                var p = _super.prototype.showLens.call(this, null);
                var container = this._element;
                var lensG = this._lens_circle_G;
                //TODO
                lensG.append("image").attr("xlink:href", this._map_path).attr("x", -this._map_width / 2).attr("y", -this._map_height / 2).attr("width", this._map_width).attr("height", this._map_height);
                lensG.transition().duration(p.duration).attr("opacity", "1");
            };
            return LocationLens;
        })(Lens.BaseSingleLens);
        Lens.LocationLens = LocationLens;
    })(Lens = ManyLens.Lens || (ManyLens.Lens = {}));
})(ManyLens || (ManyLens = {}));
var ManyLens;
(function (_ManyLens) {
    var ManyLens = (function () {
        function ManyLens() {
            this._curveView_id = "cruveView";
            this._mapView_id = "mapView";
            this._mapSvg_id = "mapSvg";
            this._historyView_id = "historyView";
            this._historySvg_id = "historySvg";
            //private _lens: Array<Lens.BaseD3Lens> = new Array<Lens.BaseD3Lens>();
            this._lens = new Map();
            this._lens_count = 0;
            this._curveView = d3.select("#" + this._curveView_id);
            this._curve = new _ManyLens.TweetsCurve.Curve(this._curveView);
            this._curve.render([10, 10]);
            this._mapView = d3.select("#" + this._mapView_id);
            this._mapSvg = d3.select("#" + this._mapSvg_id);
            this._lensPane = new _ManyLens.Pane.ClassicLensPane(this._mapSvg, this);
            this._historySvg = d3.select("#" + this._historySvg_id);
            this._historyTrees = new _ManyLens.LensHistory.HistoryTrees(this._historySvg);
            //Add a new tree here, actually the tree should not be add here
            this._historyTrees.addTree();
            this._lensPane.render();
        }
        ManyLens.prototype.AddLens = function (lens) {
            this._lens.set("lens_" + this._lens_count, lens);
            this._lens_count++;
            console.log("add Node");
            this._historyTrees.addNode({
                color: lens.LensTypeColor,
                lensType: lens.Type,
                tree_id: 0
            });
        };
        Object.defineProperty(ManyLens.prototype, "LensCount", {
            get: function () {
                return this._lens_count;
            },
            enumerable: true,
            configurable: true
        });
        ManyLens.prototype.GetLens = function (id) {
            return this._lens.get(id);
        };
        //TODO need to implementation
        ManyLens.prototype.RemoveLens = function (lens) {
            var lens;
            return lens;
        };
        return ManyLens;
    })();
    _ManyLens.ManyLens = ManyLens;
})(ManyLens || (ManyLens = {}));
///<reference path = "../tsScripts/BaseSingleLens.ts" />
var ManyLens;
(function (ManyLens) {
    var Lens;
    (function (Lens) {
        var NetworkLens = (function (_super) {
            __extends(NetworkLens, _super);
            function NetworkLens(element, manyLens) {
                _super.call(this, element, "NetworkLens", manyLens);
                this._theta = 360;
                this._tree = d3.layout.tree();
            }
            NetworkLens.prototype.render = function (color) {
                _super.prototype.render.call(this, color);
            };
            NetworkLens.prototype.extractData = function () {
                var data;
                data = {
                    "name": "flare",
                    "children": [
                        {
                            "name": "analytics",
                            "children": [
                                {
                                    "name": "cluster",
                                    "children": [
                                        { "name": "AgglomerativeCluster", "size": 3938 },
                                        { "name": "CommunityStructure", "size": 3812 },
                                        { "name": "HierarchicalCluster", "size": 6714 },
                                        { "name": "MergeEdge", "size": 743 }
                                    ]
                                },
                                {
                                    "name": "graph",
                                    "children": [
                                        { "name": "BetweennessCentrality", "size": 3534 },
                                        { "name": "LinkDistance", "size": 5731 },
                                        { "name": "MaxFlowMinCut", "size": 7840 },
                                        { "name": "ShortestPaths", "size": 5914 },
                                        { "name": "SpanningTree", "size": 3416 }
                                    ]
                                },
                                {
                                    "name": "optimization",
                                    "children": [
                                        { "name": "AspectRatioBanker", "size": 7074 }
                                    ]
                                }
                            ]
                        }
                    ]
                };
                return data;
            };
            NetworkLens.prototype.showLens = function (data, lc_cx, lc_cy) {
                if (lc_cx === void 0) { lc_cx = null; }
                if (lc_cy === void 0) { lc_cy = null; }
                var p = _super.prototype.showLens.call(this, null);
                var container = this._element;
                var lensG = this._lens_circle_G;
                var nodeRadius = 4.5;
                var diagonal = d3.svg.diagonal.radial().projection(function (d) {
                    return [d.y, d.x / 180 * Math.PI];
                });
                this._tree.size([this._theta, this._lc_radius - nodeRadius]).separation(function (a, b) {
                    return (a.parent == b.parent ? 1 : 2) / a.depth;
                });
                var nodes = this._tree.nodes(data), links = this._tree.links(nodes);
                var link = lensG.selectAll("path").data(links).enter().append("path").attr("fill", "none").attr("stroke", "#ccc").attr("stroke-width", 1.5).attr("d", diagonal);
                var node = lensG.selectAll(".node").data(nodes).enter().append("g").attr("class", "node").attr("transform", function (d) {
                    return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")";
                });
                node.append("circle").attr("r", nodeRadius).attr("stroke", "steelblue").attr("fill", "#fff").attr("stroke-width", 1.5);
                lensG.transition().duration(p.duration).attr("opacity", "1");
            };
            return NetworkLens;
        })(Lens.BaseSingleLens);
        Lens.NetworkLens = NetworkLens;
    })(Lens = ManyLens.Lens || (ManyLens.Lens = {}));
})(ManyLens || (ManyLens = {}));
///<reference path = "../tsScripts/BaseSingleLens.ts" />
var ManyLens;
(function (ManyLens) {
    var Lens;
    (function (Lens) {
        var PieChartLens = (function (_super) {
            __extends(PieChartLens, _super);
            function PieChartLens(element, manyLens) {
                _super.call(this, element, "PieChartLens", manyLens);
                this._innerRadius = this._lc_radius - 20;
                this._outterRadius = this._lc_radius - 0;
                this._pie = d3.layout.pie();
                this._arc = d3.svg.arc().innerRadius(this._innerRadius).outerRadius(this._outterRadius);
                this._color = d3.scale.category20();
            }
            PieChartLens.prototype.render = function (color) {
                _super.prototype.render.call(this, color);
            };
            PieChartLens.prototype.extractData = function () {
                var data;
                data = d3.range(6).map(function (d) {
                    return Math.random() * 70;
                });
                return data;
            };
            PieChartLens.prototype.showLens = function (data, lc_cx, lc_cy) {
                var _this = this;
                if (lc_cx === void 0) { lc_cx = null; }
                if (lc_cy === void 0) { lc_cy = null; }
                var p = _super.prototype.showLens.call(this, null);
                var container = this._element;
                var lensG = this._lens_circle_G;
                this._pie.value(function (d) {
                    return d;
                }).sort(null);
                lensG.selectAll("path").data(this._pie(data)).enter().append("path").attr("fill", function (d, i) {
                    return _this._color(i);
                }).attr("d", this._arc);
                lensG.transition().duration(p.duration).attr("opacity", "1");
            };
            return PieChartLens;
        })(Lens.BaseSingleLens);
        Lens.PieChartLens = PieChartLens;
    })(Lens = ManyLens.Lens || (ManyLens.Lens = {}));
})(ManyLens || (ManyLens = {}));
var ManyLens;
(function (ManyLens) {
    var SOMMap = (function () {
        function SOMMap() {
        }
        return SOMMap;
    })();
    ManyLens.SOMMap = SOMMap;
})(ManyLens || (ManyLens = {}));
///<reference path = "../tsScripts/BaseSingleLens.ts" />
var ManyLens;
(function (ManyLens) {
    var Lens;
    (function (Lens) {
        var WordCloudLens = (function (_super) {
            __extends(WordCloudLens, _super);
            //private _cloud_rotate: number = 0;
            function WordCloudLens(element, manyLens) {
                _super.call(this, element, "WordCloudLens", manyLens);
                this._font_size = d3.scale.sqrt();
                this._cloud = d3.layout.cloud();
                this._cloud_w = this._lc_radius * 2; //Math.sqrt(2);
                this._cloud_h = this._cloud_w;
                this._cloud_padding = 1;
                this._cloud_font = "Calibri";
                this._cloud_font_weight = "normal";
                this._cloud_text_color = d3.scale.category20c();
            }
            WordCloudLens.prototype.render = function (color) {
                if (color === void 0) { color = "red"; }
                _super.prototype.render.call(this, color);
            };
            // data shape {text: size:}
            WordCloudLens.prototype.extractData = function () {
                var data;
                data = [
                    { text: "Samsung", value: 90 },
                    { text: "Apple", value: 50 },
                    { text: "Lenovo", value: 50 },
                    { text: "LG", value: 60 },
                    { text: "Nokia", value: 30 },
                    { text: "Huawei", value: 40 },
                    { text: "Meizu", value: 50 },
                    { text: "eizu", value: 50 },
                    { text: "ZTE", value: 40 },
                    { text: "Fiiit", value: 40 },
                    { text: "qweri", value: 40 },
                    { text: "bnm", value: 40 },
                    { text: "tytyt", value: 40 },
                    { text: "asdf", value: 40 },
                    { text: "Fit", value: 40 },
                    { text: "Gear", value: 30 },
                    { text: "fear", value: 20 },
                    { text: "pear", value: 20 },
                    { text: "jjear", value: 20 },
                    { text: "weqr", value: 20 },
                    { text: "vbn", value: 20 },
                    { text: "lk", value: 20 },
                    { text: "lopxcv", value: 20 },
                    { text: "yyyy", value: 20 },
                    { text: "lxzcvk", value: 20 },
                    { text: "tyu", value: 20 },
                    { text: "jjear", value: 20 },
                    { text: "weqr", value: 20 },
                    { text: "vbn", value: 20 },
                    { text: "lk", value: 20 },
                    { text: "lopxcv", value: 20 },
                    { text: "yyyy", value: 20 },
                    { text: "lxzcvk", value: 20 },
                    { text: "tyu", value: 20 },
                    { text: "Gea", value: 10 },
                    { text: "Ge", value: 10 },
                    { text: "Gfa", value: 10 },
                    { text: "a", value: 10 },
                    { text: "bvea", value: 10 },
                    { text: "Gea", value: 10 },
                    { text: "cea", value: 10 },
                    { text: "uea", value: 10 },
                    { text: "lea", value: 10 },
                    { text: "ea", value: 10 },
                    { text: "pp", value: 10 },
                    { text: "nh", value: 10 },
                    { text: "erw", value: 10 }
                ];
                this._font_size.range([10, this._cloud_w / 8]).domain(d3.extent(data, function (d) {
                    return d.value;
                }));
                return data;
            };
            WordCloudLens.prototype.showLens = function (data, lc_cx, lc_cy) {
                var _this = this;
                if (lc_cx === void 0) { lc_cx = null; }
                if (lc_cy === void 0) { lc_cy = null; }
                var p = _super.prototype.showLens.call(this, null);
                var container = this._element;
                var lensG = this._lens_circle_G;
                lensG.transition().duration(p.duration).attr("opacity", "1");
                this._cloud.size([this._cloud_w, this._cloud_h]).words(data).padding(this._cloud_padding).rotate(0).font(this._cloud_font).fontWeight(this._cloud_font_weight).fontSize(function (d) {
                    return _this._font_size(d.value);
                }).on("end", function (words, bounds) {
                    _this.drawCloud(words, bounds);
                });
                this._cloud.start();
            };
            WordCloudLens.prototype.drawCloud = function (words, bounds) {
                var _this = this;
                var w = this._cloud_w;
                var h = this._cloud_h;
                var container = this._element;
                //Maybe need to scale, but I haven't implemented it now
                var scale = bounds ? Math.min(w / Math.abs(bounds[1].x - w / 2), w / Math.abs(bounds[0].x - w / 2), h / Math.abs(bounds[1].y - h / 2), h / Math.abs(bounds[0].y - h / 2)) / 2 : 1;
                var text = this._lens_circle_G.selectAll("text").data(words, function (d) {
                    return d.text;
                }).enter().append("text");
                text.attr("text-anchor", "middle").style("font-size", function (d) {
                    return d.size + "px";
                }).style("font-weight", function (d) {
                    return d.weight;
                }).style("font-family", function (d) {
                    return d.font;
                }).style("fill", function (d, i) {
                    return _this._cloud_text_color(d.size);
                }).style("opacity", 1e-6).attr("text-anchor", "middle").attr("transform", function (d) {
                    return "translate(" + [d.x, d.y] + ")";
                }).text(function (d) {
                    return d.text;
                }).transition().duration(200).style("opacity", 1);
            };
            return WordCloudLens;
        })(Lens.BaseSingleLens);
        Lens.WordCloudLens = WordCloudLens;
    })(Lens = ManyLens.Lens || (ManyLens.Lens = {}));
})(ManyLens || (ManyLens = {}));
//# sourceMappingURL=ManyLens.js.map