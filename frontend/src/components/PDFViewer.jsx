import { useEffect, useState } from "react";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
import workerUrl from "../pdf-worker.js";

// Set worker
pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

export default function PDFViewer({ url }) {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let cancel = false;

    const loadPDF = async () => {
      setLoading(true);
      setErrorMsg("");

      try {
        const pdf = await pdfjsLib.getDocument({ url }).promise;

        const pageList = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          pageList.push(page);
        }

        if (!cancel) setPages(pageList);
      } catch (err) {
        console.error("PDF error:", err);
        if (!cancel) setErrorMsg("Failed to load PDF");
      } finally {
        if (!cancel) setLoading(false);
      }
    };

    loadPDF();
    return () => (cancel = true);
  }, [url]);

  if (loading) return <p>Loading PDF…</p>;
  if (errorMsg) return <p>{errorMsg}</p>;

  return (
    <div>
      {pages.map((page, index) => (
        <CanvasPage key={index} page={page} />
      ))}
    </div>
  );
}

function CanvasPage({ page }) {
  return (
    <canvas
      ref={async (canvas) => {
        if (!canvas) return;

        const viewport = page.getViewport({ scale: 1.2 });
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({
          canvasContext: canvas.getContext("2d"),
          viewport,
        }).promise;
      }}
      style={{
        width: "100%",
        borderRadius: "8px",
        border: "1px solid #ddd",
        marginBottom: "20px",
      }}
    />
  );
}