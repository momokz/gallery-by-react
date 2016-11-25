/*
scrollWidth：对象的实际内容的宽度，不包边线宽度，会随对象中内容超过可视区后而变大。 

clientWidth：对象内容的可视区的宽度，不包滚动条等边线，会随对象显示大小的变化而改变。 

offsetWidth：对象整体的实际宽度，包滚动条等边线，会随对象显示大小的变化而改变。
*/
var React = require('react');
var ReactDOM = require('react-dom');

// 获取图片相关的数据
var imageDatas = require('../data/imageDatas');

// 利用自执行函数，将图片名信息转成图片URL路径信息
imageDatas = (function(imageDatasArr) {
    for (var i = 0; i < imageDatasArr.length; i++) {
        var singleImageData = imageDatasArr[i];
        singleImageData.imageURL = require('../images/' + singleImageData.filename);
        imageDatasArr[i] = singleImageData;
    }
    return imageDatasArr;
})(imageDatas);

// 获取区间内的一个随机数
function getRangeRandom(low, high) {
    return Math.ceil(Math.random() * (high - low) + low);
};

// 获取0~30度之间的一个任意正负值
function get30DegRandom() {
    return ((Math.random() > .5 ? '' : '-') + Math.ceil(Math.random() * 30));
};

var ImgFigure = React.createClass({
    // imgfigure 点击处理函数
    handleClick: function(e) {
        e.stopPropagation();
        e.preventDefault();
        if (this.props.arrange.isCenter) {
            this.props.inverse();
        } else {
            this.props.center();
        }
    },
    render: function() {
        var styleObj = {};
        // 如果props属性中指定了这张图片的位置，则使用
        if (this.props.arrange.pos) {
            styleObj = this.props.arrange.pos;
        }
        // 如果图片的选择角度有值并且不为0，添加旋转角度
        if (this.props.arrange.rotate) {
            ['MozTransform', 'WebkitTransform', 'msTransform', 'transform'].forEach(function(value) {
                styleObj[value] = 'rotate(' + this.props.arrange.rotate + 'deg)';
            }.bind(this));
        }

        if (this.props.arrange.isCenter) {
            styleObj.zIndex = 11;
        }

        var imgFigureClassName = 'img-figure';
        imgFigureClassName += this.props.arrange.isInverse ? ' is-inverse' : '';
        return (
            <figure className={imgFigureClassName} style={styleObj} onClick={this.handleClick}>
                <img src={this.props.data.imageURL} alt={this.props.data.title}/>
                <figcaption>
                    <h2 className="img-title">{this.props.data.title}</h2>
                    <div className="img-back" onClick={this.handleClick}>
                        <p>
                            {this.props.data.desc}
                        </p>
                    </div>
                </figcaption>
            </figure>
        );
    }
});

var ControllerUnit = React.createClass({
    handleClick: function(e) {
        e.preventDefault();
        e.stopPropagation();
        // 如果点击的是当前正在选中态的按钮，则翻转图片，否则将对应的图片居中
        if (this.props.arrange.isCenter) {
            this.props.inverse();
        } else {
            this.props.center();
        }
    },
    render: function() {
        var controllerUnitClassName = 'controller-unit';
        // 如果对应的是居中的图片，显示控制按钮的居中态
        if (this.props.arrange.isCenter) {
            controllerUnitClassName += ' is-center';
            // 如果同时对应的是翻转图片，显示控制按钮的翻转态
            if (this.props.arrange.isInverse) {
                controllerUnitClassName += ' is-inverse';
            }
        }
        return (
            <span className={controllerUnitClassName} onClick={this.handleClick}></span>
        );
    }
});

var GalleryByReactApp = React.createClass({
    Constant: {
        centerPos: {
            left: 0,
            top: 0
        },
        hPosRange: { //　水平方向的取值范围
            leftSecX: [0, 0],
            rightSecX: [0, 0],
            y: [0, 0]
        },
        vPosRange: { // 垂直方法的取值范围
            x: [0, 0],
            topY: [0, 0]
        }
    },
    // 组件加载后，为每张图片计算其位置范围
    componentDidMount: function() {
        // 拿到舞台的大小
        var stageW = this.refs.stage.scrollWidth,
            stageH = this.refs.stage.scrollHeight,
            halfStageW = Math.ceil(stageW / 2),
            halfStageH = Math.ceil(stageH / 2);

        // 拿到一个imgfigure的大小
        var imgFigureDOM = ReactDOM.findDOMNode(this.refs.imgFigure0),
            imgW = imgFigureDOM.scrollWidth,
            imgH = imgFigureDOM.scrollHeight,
            halfImgW = Math.ceil(imgW / 2),
            halfImgH = Math.ceil(imgH / 2);

        // 计算中心图片的位置点
        this.Constant.centerPos = {
            left: halfStageW - halfImgW,
            top: halfStageH - halfImgH
        };

        // 计算左侧，右侧区域图片的排布位置的取值范围
        this.Constant.hPosRange.leftSecX[0] = -halfImgW;
        this.Constant.hPosRange.leftSecX[1] = halfStageW - halfImgW * 3;
        this.Constant.hPosRange.rightSecX[0] = halfStageW + halfImgW;
        this.Constant.hPosRange.rightSecX[1] = stageW - halfImgW;
        this.Constant.hPosRange.y[0] = -halfImgH;
        this.Constant.hPosRange.y[1] = stageH - halfImgH;

        // 计算上侧区域图片排布未知的取值范围
        this.Constant.vPosRange.topY[0] = -halfImgH;
        this.Constant.vPosRange.topY[1] = halfStageH - halfImgH * 3;
        this.Constant.vPosRange.x[0] = halfStageW - imgW;
        this.Constant.vPosRange.x[1] = halfStageW;

        this.rearrange(0);
    },
    /*
        重新布局所有图片
        param centerIndex 指定居中的是那个图片
    */
    rearrange: function(centerIndex) {
        var imgsArrangeArr = this.state.imgsArrangeArr,
            Constant = this.Constant,
            centerPos = Constant.centerPos,
            hPosRange = Constant.hPosRange,
            vPosRange = Constant.vPosRange,
            hPosRangeLeftSexC = hPosRange.leftSecX,
            hPosRangeRightSexC = hPosRange.rightSecX,
            hPosRangeY = hPosRange.y,
            vPosRangeTopY = vPosRange.topY,
            vPosRangeX = vPosRange.x,
            imgsArrangeTopArr = [],
            topImgNum = Math.floor(Math.random() * 2), // 取一个或者不取
            topImgSpliceIndex = 0,
            imgsArrangeCenterArr = imgsArrangeArr.splice(centerIndex, 1);

        // 首先居中 centerIndex的图片,剧中的centerIndex的图片不需要旋转
        imgsArrangeCenterArr[0] = {
            pos: centerPos,
            rotate: 0,
            isCenter: true
        };

        // 取出要在上侧布局的图片的状态信息
        topImgSpliceIndex = Math.ceil((Math.random() * (imgsArrangeArr.length - topImgNum)));
        imgsArrangeTopArr = imgsArrangeArr.splice(topImgSpliceIndex, topImgNum);

        // 布局位于上侧的图片
        imgsArrangeTopArr.forEach(function(value, index) {
            imgsArrangeTopArr[index] = {
                pos: {
                    top: getRangeRandom(vPosRangeTopY[0], vPosRangeTopY[1]),
                    left: getRangeRandom(vPosRangeX[0], vPosRangeX[1])
                },
                rotate: get30DegRandom(),
                isCenter: false
            }
        });

        // 布局两侧的图片
        for (var i = 0, j = imgsArrangeArr.length, k = j / 2; i < j; i++) {
            var hPosRangeLORX = null;
            // 前半部分布局左边, 后半部分布局右边
            if (i < k) {
                hPosRangeLORX = hPosRangeLeftSexC;
            } else {
                hPosRangeLORX = hPosRangeRightSexC;
            }
            imgsArrangeArr[i] = {
                pos: {
                    top: getRangeRandom(hPosRangeY[0], hPosRangeY[1]),
                    left: getRangeRandom(hPosRangeLORX[0], hPosRangeLORX[1])
                },
                rotate: get30DegRandom(),
                isCenter: false
            }
        }
        if (imgsArrangeTopArr && imgsArrangeTopArr[0]) {
            imgsArrangeArr.splice(topImgSpliceIndex, 0, imgsArrangeTopArr[0]);
        }
        imgsArrangeArr.splice(centerIndex, 0, imgsArrangeCenterArr[0]);

        this.setState({
            imgsArrangeArr: imgsArrangeArr
        });
    },
    getInitialState: function() {
        return {
            imgsArrangeArr: [
                /*{
                    pos: {
                        left: 0,
                        top: 0
                    },
                    rotate: 0, // 旋转角度
                    isInverse: false, // 图片正反面
                    isCenter: false // 图片是否居中
                }*/
            ]
        }
    },
    /*
        翻转图片
        param index 输入当前被执行inverse操作的图片对应的图片信息数组的index
        return function 这是一个闭包函数
    */
    inverse: function(index) {
        return function() {
            var imgsArrangeArr = this.state.imgsArrangeArr;
            imgsArrangeArr[index].isInverse = !imgsArrangeArr[index].isInverse;
            this.setState({
                imgsArrangeArr: imgsArrangeArr
            })
        }.bind(this);
    },
    /*
    利用rearrange函数，居中对应index的图片
    param index，需要被居中的图片对应的图片信息数组的index值
    return function(){}
    */
    center: function(index) {
        return function() {
            this.rearrange(index);
        }.bind(this);
    },
    render: function() {
        var controllerUnits = [];
        var imgFigures = [];
        imageDatas.forEach(function(value, index) {
            if (!this.state.imgsArrangeArr[index]) {
                this.state.imgsArrangeArr[index] = {
                    pos: {
                        left: 0,
                        top: 0
                    },
                    rotate: 0,
                    isInverse: false,
                    isCenter: false
                }
            }
            imgFigures.push(<ImgFigure key={index} data={value} ref={'imgFigure'+index} arrange={this.state.imgsArrangeArr[index]} inverse={this.inverse(index)} center={this.center(index)}/>);

            controllerUnits.push(<ControllerUnit key={index} arrange={this.state.imgsArrangeArr[index]} inverse={this.inverse(index)} center={this.center(index)}/>);
        }.bind(this));
        return (
            <section className="stage" ref="stage">
                <section className="img-sec">
                    {imgFigures}
                </section>
                <nav className="controller-nav">
                    {controllerUnits}
                </nav>
            </section>
        );
    }
});

module.exports = GalleryByReactApp;