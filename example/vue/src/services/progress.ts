import Konva from "konva";
import Text from "./text";
export default class Progress {
  /** 进度条对象  */
  innerRect: Konva.Rect;
  /** 100%时候进度条的长度 */
  width: number;
  /** 进度条是否正在加载 */
  running: boolean = false;
  /** 进度条是否已经完成加载了 */
  done: boolean = false;
  /** 进度条的前置符号 */
  prefix: Text;
  /** 进度条的所在的背景平台(Stage, Layer) */
  bg: Background;
  /** 同步运行本进度条的进度条 */
  follower: Set<Progress> = new Set();
  /** 追随的目标进度条 */
  master: Progress | null = null;
  /** 是否是主进度条，即不追随它人的进度条 */
  isMaster: boolean = false;
  /** 查找追随者 */
  find?: () => void;
  /** 执行完run的同步函数的回调 */
  runCallback?: () => void;
  constructor(
    bg: Background,
    position: Position,
    width: number = 100,
    height: number = 8
  ) {
    this.width = width;
    this.bg = bg;
    const layer = bg.layer;
    /** 初始化进度条 */
    this.innerRect = new Konva.Rect({
      ...position,
      width: 10,
      height,
      fill: "#909399",
      cornerRadius: height / 2,
    });
    /** 初始化进度条外边框 */
    const outerRect = new Konva.Rect({
      ...position,
      width,
      height,
      fill: "#ebeef5",
      cornerRadius: height / 2,
    });

    /** 创建前缀 */
    this.prefix = new Text(bg, { x: position.x - 35, y: position.y - 8 });
    this.prefix.text.on("click", () => {
      this.run();
    });

    layer.add(outerRect);
    layer.add(this.innerRect);
    layer.draw();
  }

  /** 运行进度条 */
  run(duration: number = 2) {
    this.prefix.text.off("mouseenter");
    this.bg.stage.container().style.cursor = "default";
    this.prefix.text.off("click");
    this.prefix.text.off("mouseleave");
    if (this.running) {
      return;
    }
    if (this.find) {
      this.find();
    }
    this.running = true;
    /** 有目标会通过自动追随目标更新进度条状态，没有目标则要自己更新进度条状态 */
    if (!this.master) {
      this.isMaster = true;
      this.innerRect.to({
        fill: "#409eff",
        duration: 0.25,
        easing: Konva.Easings.EaseInOut,
      });
      this.innerRect.to({
        width: this.width,
        duration,
        onUpdate: () => {
          this.follower.forEach((ele) => {
            if (ele.running) ele.innerRect.width(this.innerRect.width());
          });
        },
        onFinish: () => {
          this.fulfilled();
          this.follower.forEach((ele) => {
            if (ele.running) {
              ele.innerRect.width(ele.width);
              ele.fulfilled();
            }
          });
        },
        easing: Konva.Easings.EaseInOut,
      });
    }
    /** 如果目标已经完成，则立即完成 */
    if (this.master?.done) {
      this.fulfilled();
    } else {
      this.innerRect.fill("#409eff");
    }
    if (this.runCallback) {
      this.runCallback();
    }
  }

  reset() {
    if (this.done && !this.running) {
      this.running = true;
      this.done = false;
      this.innerRect.to({
        width: 10,
        fill: "#909399",
        duration: 0.3,
        easing: Konva.Easings.EaseInOut,
      });
      setTimeout(() => {
        this.running = false;
      }, 300);
    }
  }

  chase(target: Progress) {
    target.follower.add(this);
    this.master = target;
  }

  /** 进入完成状态 */
  fulfilled() {
    this.innerRect.width(this.width);
    this.innerRect.to({
      fill: "#67c23a",
      duration: 0.25,
      onFinish: () => {
        this.done = true;
        this.running = false;
        this.prefix.text.text("⭐️");
      },
      easing: Konva.Easings.EaseInOut,
    });
  }
}
