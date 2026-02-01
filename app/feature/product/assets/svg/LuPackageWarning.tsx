import { GenIcon, type IconBaseProps } from "react-icons";

export function LuPackageWarning(props: IconBaseProps = {}) {
  return GenIcon({
    tag: "svg",
    attr: {
      stroke: "currentColor",
      fill: "none",
      strokeWidth: "2",
      viewBox: "0 0 24 24",
      strokeLinecap: "round",
      strokeLinejoin: "round",
    },
    child: [
      { tag: "path", attr: { d: "M19.3 14.7v3.5" }, child: [] },
      { tag: "path", attr: { d: "M19.3 21.2v.01" }, child: [] },
      {
        tag: "path",
        attr: {
          d: "M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14",
        },
        child: [],
      },
      { tag: "path", attr: { d: "m7.5 4.27 9 5.15" }, child: [] },
      { tag: "polyline", attr: { points: "3.29 7 12 12 20.71 7" }, child: [] },
      { tag: "line", attr: { x1: "12", x2: "12", y1: "22", y2: "12" }, child: [] },
    ],
  })(props);
}

export default LuPackageWarning;
