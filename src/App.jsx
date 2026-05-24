import { Component } from "react";
import TgKanalPage from "./platform/pages/TgKanalPage";

class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(e) { return { error: e }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 40, fontFamily: "monospace", whiteSpace: "pre-wrap", background: "#fff" }}>
          <b style={{ color: "red" }}>Runtime error:</b>{"\n\n"}
          {String(this.state.error)}{"\n\n"}
          {this.state.error?.stack}
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return <ErrorBoundary><TgKanalPage /></ErrorBoundary>;
}
