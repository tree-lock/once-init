import Konva from "konva";

export default class Text {
  text: Konva.Text;
  constructor(bg: Background, position: Position) {
    this.text = new Konva.Text({
      ...position,
      text: "🚀",
      fontSize: 24,
    });
    const { layer, stage } = bg;
    this.text.on("mouseenter", function () {
      stage.container().style.cursor = "pointer";
    });

    this.text.on("mouseleave", function () {
      stage.container().style.cursor = "default";
    });
    layer.add(this.text);
  }
}
