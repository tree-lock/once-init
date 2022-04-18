import Konva from "konva";
import Progress from "./progress";
import Text from "./text";

declare global {
  interface Position {
    x: number;
    y: number;
  }
  interface Background {
    layer: Konva.Layer;
    stage: Konva.Stage;
  }
}

export default { Progress, Text };
