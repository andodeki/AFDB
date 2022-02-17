import React, { Component } from "react";

import {
  PdfLoader,
  PdfHighlighter,
  Tip,
  Highlight,
  Popup,
  AreaHighlight,
} from "./react-pdf-highlighter";

import type { IHighlight, NewHighlight } from "./react-pdf-highlighter";

import { testHighlights as _testHighlights } from "./test-highlights";
import { Spinner } from "./Spinner";
import { Sidebar } from "./Sidebar";

import "./style/App.css";

//URLS
const CHILD_URL = "http://localhost:3000";
const PARENT_URL = "http://localhost:5000";

// const testHighlights: Record<string, Array<IHighlight>> = _testHighlights;

interface State {
  highlights: Array<IHighlight>;
}

const getNextId = () => String(Math.random()).slice(2);

const parseIdFromHash = () =>
  document.location.hash.slice("#highlight-".length);

const resetHash = () => {
  document.location.hash = "";
};

const HighlightPopup = ({
  comment,
}: {
  comment: { text: string; emoji: string };
}) =>
  comment.text ? (
    <div className="Highlight__popup">
      {comment.emoji} {comment.text}
    </div>
  ) : null;

//get fileId and file retrieval URL from child app URL
const searchParams = new URLSearchParams(document.location.search);
const fileId = searchParams.get("fileId") || "";
const url = PARENT_URL + "/retrieveFile/" + fileId || "";

class App extends Component<{}, State> {
  state = {
    highlights: [],
  };

  resetHighlights = () => {
    this.setState({
      highlights: [],
    });
  };

  // toggleDocument = () => {
  //   const newUrl =
  //     this.state.url === PRIMARY_PDF_URL ? SECONDARY_PDF_URL : PRIMARY_PDF_URL;

  //   this.setState({
  //     url: newUrl,
  //     highlights: testHighlights[newUrl] ? [...testHighlights[newUrl]] : [],
  //   });
  // };

  scrollViewerTo = (highlight: any) => {};

  scrollToHighlightFromHash = () => {
    const highlight = this.getHighlightById(parseIdFromHash());

    if (highlight) {
      this.scrollViewerTo(highlight);
    }
  };

  // setFileUrl = (args: any) => {
  //   this.setState({
  //     fileId: args.fileId,
  //   });
  //   this.setState({
  //     url: "http://localhost:5000/retrieveFile/" + args.fileId,
  //   });
  // };

  setHighlights = (args: any) => {
    this.setState({
      highlights: args.highlights,
    });
  };

  setHighlightHash = (args: any) => {
    document.location.hash = "#highlight-" + args.highlightId;
    this.scrollToHighlightFromHash();
  };

  messageHandler = (message: any) => {
    //function adapter mapping
    let functionAdapter = new Map<string, Function>();
    // functionAdapter.set("setFileUrl", this.setFileUrl);
    functionAdapter.set("setHighlights", this.setHighlights);
    functionAdapter.set("setHighlightHash", this.setHighlightHash);

    if (message.origin === PARENT_URL) {
      let functionName: string = message.data.function;
      let parentFileId: string = message.data.fileId;
      let args = message.data.args;

      if (args && parentFileId === fileId) {
        const fn = functionAdapter.get(functionName);
        if (fn) {
          fn(args);
        } else {
          console.log("invalid-function-name");
        }
      }
    } else if (message.origin === CHILD_URL) {
      console.log("Message received on child from own URL");
    } else {
      console.log(
        "Message received on child from blocked origin " + message.origin
      );
    }
  };

  componentDidMount() {
    window.addEventListener(
      "hashchange",
      this.scrollToHighlightFromHash,
      false
    );

    window.addEventListener("message", this.messageHandler, false);
  }

  componentWillUnMount() {
    window.removeEventListener("message", this.messageHandler, false);
  }

  getHighlightById(id: string) {
    const { highlights } = this.state;

    return highlights.find((highlight) => highlight.id === id);
  }

  sendHighlights() {
    window.parent.postMessage(
      {
        fileId: fileId,
        function: "saveHighlights",
        args: { highlights: this.state.highlights },
      },
      PARENT_URL
    );
  }

  sendHighlight(highlight: any) {
    window.parent.postMessage(
      {
        fileId: fileId,
        function: "insertHighlight",
        args: { highlight },
      },
      PARENT_URL
    );
  }

  // componentDidUpdate(prevProps, prevState) {
  //   //highlights were updated, relay new highlights array to parent app
  //   if (prevState.highlights !== this.state.highlights) {
  //     this.sendHighlights();
  //   }
  // }

  addHighlight(highlight: NewHighlight) {
    const { highlights } = this.state;

    const newHighlight = { ...highlight, id: getNextId() };

    this.setState({
      highlights: [newHighlight, ...highlights],
    });

    this.sendHighlight(newHighlight);
  }

  updateHighlight(highlightId: string, position: Object, content: Object) {
    console.log("Updating highlight", highlightId, position, content);

    this.setState({
      highlights: this.state.highlights.map((h) => {
        const {
          id,
          position: originalPosition,
          content: originalContent,
          ...rest
        } = h;
        return id === highlightId
          ? {
              id,
              position: { ...originalPosition, ...position },
              content: { ...originalContent, ...content },
              ...rest,
            }
          : h;
      }),
    });
  }

  render() {
    const { highlights } = this.state;

    return (
      <div className="App" style={{ display: "flex", height: "100vh" }}>
        {/* <Sidebar
          highlights={highlights}
          resetHighlights={this.resetHighlights}
          // toggleDocument={this.toggleDocument}
        /> */}
        <div
          style={{
            height: "100vh",
            width: "100vw",
            position: "relative",
          }}
        >
          <PdfLoader url={url} beforeLoad={<Spinner />}>
            {(pdfDocument) => (
              <PdfHighlighter
                pdfDocument={pdfDocument}
                enableAreaSelection={(event) => event.altKey}
                onScrollChange={resetHash}
                // pdfScaleValue="page-width"
                scrollRef={(scrollTo) => {
                  this.scrollViewerTo = scrollTo;

                  this.scrollToHighlightFromHash();
                }}
                onSelectionFinished={(
                  position,
                  content,
                  hideTipAndSelection,
                  transformSelection
                ) => (
                  <Tip
                    onOpen={transformSelection}
                    onConfirm={(comment) => {
                      this.addHighlight({ content, position, comment });

                      hideTipAndSelection();
                    }}
                  />
                )}
                highlightTransform={(
                  highlight,
                  index,
                  setTip,
                  hideTip,
                  viewportToScaled,
                  screenshot,
                  isScrolledTo
                ) => {
                  const isTextHighlight = !Boolean(
                    highlight.content && highlight.content.image
                  );

                  const component = isTextHighlight ? (
                    <Highlight
                      isScrolledTo={isScrolledTo}
                      position={highlight.position}
                      comment={highlight.comment}
                    />
                  ) : (
                    <AreaHighlight
                      isScrolledTo={isScrolledTo}
                      highlight={highlight}
                      onChange={(boundingRect) => {
                        this.updateHighlight(
                          highlight.id,
                          { boundingRect: viewportToScaled(boundingRect) },
                          { image: screenshot(boundingRect) }
                        );
                      }}
                    />
                  );

                  return (
                    <Popup
                      popupContent={<HighlightPopup {...highlight} />}
                      onMouseOver={(popupContent) =>
                        setTip(highlight, (highlight) => popupContent)
                      }
                      onMouseOut={hideTip}
                      key={index}
                      children={component}
                    />
                  );
                }}
                highlights={highlights}
              />
            )}
          </PdfLoader>
        </div>
      </div>
    );
  }
}

export default App;
