import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  FiFileText,
  FiCopy,
  FiDownload,
  FiZap,
  FiImage,
  FiFile,
  FiUpload,
} from "react-icons/fi";
import PDFViewer from "../../components/PDFViewer.jsx";

// Static file data
const STATIC_FILES = [
  {
    id: "1",
    filename: "1.pdf",
    fileType: "application/pdf",
    fileUrl: "/1.pdf",
    fileSize: 245678,
    uploadedAt: new Date().toISOString(),
    summary: `The document provides comprehensive lecture notes on Computer Networks and Internet & Web Technology. It begins with the evolution of the Internet, explaining ARPANET, packet switching, and the development of TCP/IP protocols. It covers fundamental concepts of data communication, transmission modes (simplex, half-duplex, full-duplex), synchronous vs. asynchronous transmission, and types of computer networks including LAN, MAN, WAN, along with reliability and authentication methods.

The notes explain network topologies (bus, star, ring), protocols, and internetworking technologies that allow heterogeneous systems to communicate. Detailed descriptions of hardware devices like hubs, bridges, switches, routers, and gateways are included. It also presents OSI and TCP/IP models, describing the functions of each layer and key protocols.

The core networking concepts such as packet switching, circuit switching, datagram networks, and virtual circuits are explained with diagrams and examples. IP addressing (Class A–E), subnetting basics, IPv4 packet format, routing, and important organizations like IETF, IEEE, ITU, and ATM technology are covered.

The final section discusses firewalls, their types (packet filter, application gateway, circuit-level gateway), NAT, firewall capabilities, limitations, and security policies to protect networks.`,
    questions: [
      {
        id: "q1",
        question: "Which historic network project is mentioned as the origin of the Internet in the notes?",
        options: ["ARPANET", "CSNET", "BITNET", "ARPANET-II"],
        correctAnswer: 0,
        explanation: "The notes explicitly mention ARPANET as the early research network that led to the Internet."
      },
      {
        id: "q2",
        question: "Which two reference models/protocol stacks are described in the document?",
        options: ["OSI and TCP/IP", "HTTP and FTP", "SMTP and IMAP", "Ethernet and Wi-Fi"],
        correctAnswer: 0,
        explanation: "The notes present both the OSI model and the TCP/IP model, describing the function of each layer."
      },
      {
        id: "q3",
        question: "What addressing and routing topics are covered in the notes?",
        options: ["IP addressing, subnetting, IPv4 packet format", "MAC addressing only", "DNS internals", "BGP configuration examples"],
        correctAnswer: 0,
        explanation: "The summary mentions IP addressing (Classes A–E), subnetting basics, and the IPv4 packet format."
      },
      {
        id: "q4",
        question: "Which switching techniques are explained with examples in the document?",
        options: ["Packet switching and circuit switching", "Circuit switching only", "Virtual switching only", "Store-and-forward switching"],
        correctAnswer: 0,
        explanation: "The notes explain packet switching, circuit switching, datagram networks, and virtual circuits."
      },
      {
        id: "q5",
        question: "Which security topics does the final section discuss?",
        options: ["Firewalls (types), NAT, and security policies", "SSL/TLS handshake internals", "Encryption algorithms only", "Physical security of hardware"],
        correctAnswer: 0,
        explanation: "The final section covers firewalls (packet filter, application gateway, circuit-level gateway), NAT, and security policies."
      }
    ],
    flowchartUrl: "1.pdf"
  },
  {
    id: "2",
    filename: "2.png",
    fileType: "image/png",
    fileUrl: "/2.png",
    fileSize: 123456,
    uploadedAt: new Date().toISOString(),
    summary: `A lady goes shopping with some amount of money.
The question describes how she spends her money in three stages, and after all the spending, she is left with exactly 1 rupee when she reaches home.

The three stages are:
  1.	First spending:
She spends half of the total money she had on buying handkerchiefs.
→ After this, half of her original money remains.
  2.	Second spending:
She again spends half of whatever money was left after buying the handkerchiefs.
→ So now only half of that remaining amount is left with her.
  3.	Third spending:
She spends half of the amount she had after the second spending on buying a book.
→ After this, only half of that amount is left.

Finally, after all these three “spend half” steps, the money she has left is 1 rupee.`,
    questions: [
      {
        id: "q1",
        question: "How many spending stages does the lady go through?",
        options: ["One", "Two", "Three", "Four"],
        correctAnswer: 2,
        explanation: "The lady goes through three spending stages: buying handkerchiefs, second spending, and buying a book."
      },
      {
        id: "q2",
        question: "What does the lady buy in the first spending stage?",
        options: ["A book", "Handkerchiefs", "Clothes", "Food"],
        correctAnswer: 1,
        explanation: "In the first spending stage, she spends half of her total money on buying handkerchiefs."
      },
      {
        id: "q3",
        question: "How much money is left with the lady after all three spending stages?",
        options: ["2 rupees", "1 rupee", "0.5 rupees", "3 rupees"],
        correctAnswer: 1,
        explanation: "After all three 'spend half' steps, the lady is left with exactly 1 rupee when she reaches home."
      },
      {
        id: "q4",
        question: "What is the pattern of spending in each stage?",
        options: ["Spend all money", "Spend half of remaining money", "Spend one-third", "Spend a fixed amount"],
        correctAnswer: 1,
        explanation: "In each stage, she spends half of whatever money she has at that point."
      }
    ],
    flowchartUrl: "/assets/b.svg"
  }
];

export default function Summarizer() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [userFiles, setUserFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [showQuestions, setShowQuestions] = useState(false);
  const [showFlowchart, setShowFlowchart] = useState(false);

  // Load static files on mount
  useEffect(() => {
    setLoading(true);
    // Simulate loading
    setTimeout(() => {
      setUserFiles(STATIC_FILES);
      setLoading(false);
    }, 500);
  }, []);

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`;
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
    }
  };

  const handleFileUpload = async () => {
    if (!file) {
      toast.error("Please select a file");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      // Simulate file upload delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Create object URL for preview (since we're not actually uploading)
      const fileUrl = URL.createObjectURL(file);

      // Generate mock summary based on file type
      const isPDF = file.type === "application/pdf";
      const isImage = file.type.startsWith("image/");

      const mockSummary = isPDF
        ? `# PDF Document Summary: ${file.name}

## Overview
This PDF document (${file.name}) has been successfully uploaded and analyzed. The document contains structured information that has been processed for summarization.

## Key Points
1. **Document Type**: PDF file
2. **File Size**: ${formatFileSize(file.size)}
3. **Upload Date**: ${new Date().toLocaleDateString()}

## Content Analysis
- The document has been processed successfully
- Key information has been extracted
- Summary and questions have been generated

## Next Steps
You can now view the summary, flowchart, and questions for this document.`
        : isImage
        ? `# Image Analysis Summary: ${file.name}

## Overview
This image (${file.name}) has been successfully uploaded and analyzed. The image contains visual information that has been processed.

## Image Details
1. **File Type**: ${file.type}
2. **File Size**: ${formatFileSize(file.size)}
3. **Upload Date**: ${new Date().toLocaleDateString()}

## Visual Analysis
- Image has been processed successfully
- Visual elements have been identified
- Summary and questions have been generated

## Next Steps
You can now view the summary, flowchart, and questions for this image.`
        : `# File Summary: ${file.name}

## Overview
This file (${file.name}) has been successfully uploaded and processed.

## File Details
- **File Type**: ${file.type}
- **File Size**: ${formatFileSize(file.size)}
- **Upload Date**: ${new Date().toLocaleDateString()}

## Processing Complete
The file has been processed and is ready for review.`;

      // Generate mock questions
      const mockQuestions = [
        {
          id: "q1",
          question: `What type of file is ${file.name}?`,
          options: [
            file.type.includes("pdf") ? "PDF Document" : file.type.includes("image") ? "Image File" : "Other File",
            "Text Document",
            "Spreadsheet",
            "Presentation",
          ],
          correctAnswer: 0,
          explanation: `This is a ${file.type} file.`,
        },
        {
          id: "q2",
          question: `What is the size of ${file.name}?`,
          options: [
            formatFileSize(file.size),
            "Less than 1MB",
            "More than 10MB",
            "Unknown",
          ],
          correctAnswer: 0,
          explanation: `The file size is ${formatFileSize(file.size)}.`,
        },
        {
          id: "q3",
          question: "When was this file uploaded?",
          options: [
            "Today",
            "Yesterday",
            "Last week",
            "Last month",
          ],
          correctAnswer: 0,
          explanation: "The file was uploaded today.",
        },
      ];

      // Create new file object
      const newFile = {
        id: Date.now().toString(),
        filename: file.name,
        fileType: file.type,
        fileUrl: fileUrl,
        fileSize: file.size,
        uploadedAt: new Date().toISOString(),
        summary: mockSummary,
        questions: mockQuestions,
        flowchartUrl: isPDF ? "/flowchart-pdf.png" : "/flowchart-image.png",
      };

      // Complete upload progress
      setUploadProgress(100);
      clearInterval(progressInterval);

      // Add file to list
      setUserFiles((prev) => [newFile, ...prev]);
      setSelectedFile(newFile);
      setShowSummary(false);
      setShowQuestions(false);
      setShowFlowchart(false);

      // Reset file input
      setFile(null);
      const input = document.querySelector('input[type="file"]');
      if (input) input.value = "";

      toast.success("File uploaded successfully!");
    } catch (error) {
      toast.error("Failed to upload file");
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    // Show preview by default, hide other sections
    setShowSummary(false);
    setShowQuestions(false);
    setShowFlowchart(false);
  };

  const handleCopySummary = () => {
    if (selectedFile?.summary) {
      navigator.clipboard.writeText(selectedFile.summary);
      toast.success("Summary copied to clipboard!");
    }
  };

  const handleDownloadSummary = () => {
    if (selectedFile?.summary) {
      const blob = new Blob([selectedFile.summary], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `summary-${selectedFile.filename}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Summary downloaded!");
    }
  };

  const handleCopyQuestions = () => {
    if (selectedFile?.questions) {
      const questionsJson = JSON.stringify(selectedFile.questions, null, 2);
      navigator.clipboard.writeText(questionsJson);
      toast.success("Questions JSON copied to clipboard!");
    }
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading files...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
          Smart Summarizer
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ================= LEFT PANEL ================= */}
          <div className="lg:col-span-1 space-y-6">
            {/* Upload Box */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-4">Upload File</h2>

              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 p-6 rounded-lg text-center hover:border-blue-500 transition">
                <FiUpload className="w-12 h-12 text-gray-400 mx-auto mb-3" />

                <label className="cursor-pointer">
                  <span className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                    Click to upload
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    or drag & drop
                  </p>
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.jpeg,.png,.txt,.doc,.docx"
                    disabled={uploading}
                  />
                </label>
              </div>

              {file && (
                <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
                  <p className="font-medium truncate text-gray-900 dark:text-white">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              )}

              {/* Upload Progress */}
              {uploading && (
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Uploading...
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {uploadProgress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <button
                onClick={handleFileUpload}
                disabled={!file || uploading}
                className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <FiUpload className="w-4 h-4" />
                    <span>Upload File</span>
                  </>
                )}
              </button>
            </div>

            {/* Files List */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-4">Available Files</h2>

              {userFiles.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {userFiles.map((file) => (
                    <div
                      key={file.id}
                      onClick={() => handleFileSelect(file)}
                      className={`p-4 rounded border cursor-pointer transition ${
                        selectedFile?.id === file.id
                          ? "bg-blue-50 dark:bg-blue-900/20 border-blue-500"
                          : "bg-gray-50 dark:bg-gray-700 hover:border-blue-500"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {file.fileType === "application/pdf" ? (
                          <FiFile className="text-red-500" />
                        ) : (
                          <FiImage className="text-green-500" />
                        )}
                        <h4 className="font-semibold truncate text-gray-900 dark:text-white">
                          {file.filename}
                        </h4>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {formatDate(file.uploadedAt)} • {formatFileSize(file.fileSize)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-8 text-gray-500">No files available.</p>
              )}
            </div>
          </div>

          {/* ================= RIGHT PANEL ================= */}
          <div className="lg:col-span-2 space-y-6">
            {selectedFile ? (
              <div className="space-y-6">
                {/* File Preview */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {selectedFile.filename}
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {formatDate(selectedFile.uploadedAt)} • {formatFileSize(selectedFile.fileSize)}
                      </p>
                    </div>
                  </div>

                </div>

                {/* Action Buttons */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => {
                        setShowSummary(false);
                        setShowQuestions(false);
                        setShowFlowchart(false);
                      }}
                      className={`px-4 py-2 rounded-lg font-medium transition ${
                        !showSummary && !showQuestions && !showFlowchart
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                      }`}
                    >
                      <FiFile className="inline mr-2" />
                      Preview
                    </button>
                    <button
                      onClick={() => {
                        setShowSummary(true);
                        setShowQuestions(false);
                        setShowFlowchart(false);
                      }}
                      className={`px-4 py-2 rounded-lg font-medium transition ${
                        showSummary
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                      }`}
                    >
                      <FiFileText className="inline mr-2" />
                      Summary
                    </button>
                    <button
                      onClick={() => {
                        setShowFlowchart(true);
                        setShowSummary(false);
                        setShowQuestions(false);
                      }}
                      className={`px-4 py-2 rounded-lg font-medium transition ${
                        showFlowchart
                          ? "bg-purple-600 text-white"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                      }`}
                    >
                      <FiZap className="inline mr-2" />
                      Flowchart
                    </button>
                    <button
                      onClick={() => {
                        setShowQuestions(true);
                        setShowSummary(false);
                        setShowFlowchart(false);
                      }}
                      className={`px-4 py-2 rounded-lg font-medium transition ${
                        showQuestions
                          ? "bg-green-600 text-white"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                      }`}
                    >
                      <FiFileText className="inline mr-2" />
                      Questions
                    </button>
                  </div>
                </div>

                {/* Preview Section - Show by default when no other section is active */}
                {!showSummary && !showQuestions && !showFlowchart && (
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                      File Preview
                    </h3>
                    <div className="mt-4">
                      {selectedFile.fileType?.startsWith("image/") && (
                        <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
                          <img
                            src={selectedFile.fileUrl}
                            alt={selectedFile.filename}
                            className="w-full max-h-[600px] rounded shadow object-contain mx-auto"
                            onError={(e) => {
                              e.target.src = "https://via.placeholder.com/600x400?text=Image+Not+Found";
                            }}
                          />
                        </div>
                      )}

                      {selectedFile.fileType === "application/pdf" && (
                        <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
                          <PDFViewer url={selectedFile.fileUrl} />
                        </div>
                      )}

                      {!selectedFile.fileType?.startsWith("image/") &&
                        selectedFile.fileType !== "application/pdf" && (
                          <div className="p-8 bg-gray-100 dark:bg-gray-900 rounded-lg text-center">
                            <FiFileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600 dark:text-gray-400">
                              Preview not available for this file type
                            </p>
                            <a
                              href={selectedFile.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 dark:text-blue-400 hover:underline mt-2 inline-block"
                            >
                              Open file in new tab
                            </a>
                          </div>
                        )}
                    </div>
                  </div>
                )}

                {/* Summary Section */}
                {showSummary && selectedFile.summary && (
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        Summary
                      </h3>
                      <div className="flex gap-2">
                        <button
                          onClick={handleCopySummary}
                          className="p-2 bg-blue-100 dark:bg-blue-900/20 text-blue-600 rounded hover:bg-blue-200 dark:hover:bg-blue-900/40 transition"
                          title="Copy Summary"
                        >
                          <FiCopy />
                        </button>
                        <button
                          onClick={handleDownloadSummary}
                          className="p-2 bg-green-100 dark:bg-green-900/20 text-green-600 rounded hover:bg-green-200 dark:hover:bg-green-900/40 transition"
                          title="Download Summary"
                        >
                          <FiDownload />
                        </button>
                      </div>
                    </div>
                    <div className="prose dark:prose-invert max-w-none">
                      <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 p-4 rounded">
                        {selectedFile.summary}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Flowchart Section */}
                {showFlowchart && (
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                      Flowchart
                    </h3>
                    <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
                      {selectedFile.flowchartUrl?.toLowerCase().endsWith(".pdf") ? (
    // use the existing PDFViewer component to render PDF flowcharts
    <div className="w-full h-[500px]">
      <PDFViewer url={selectedFile.flowchartUrl} />
    </div>
  ) : (
    <img
      src={selectedFile.flowchartUrl}
      alt="Flowchart"
      className="w-full max-h-[500px] object-contain rounded"
      onError={(e) => {
        e.target.src = "https://via.placeholder.com/800x600?text=Flowchart+Image+Not+Found";
      }}
    />
  )}
                    </div>
                  </div>
                )}

                {/* Questions Section */}
                {showQuestions && selectedFile.questions && (
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        Questions (JSON Data)
                      </h3>
                      <button
                        onClick={handleCopyQuestions}
                        className="p-2 bg-blue-100 dark:bg-blue-900/20 text-blue-600 rounded hover:bg-blue-200 dark:hover:bg-blue-900/40 transition"
                        title="Copy Questions JSON"
                      >
                        <FiCopy />
                      </button>
                    </div>
                    
                    {/* Questions Display */}
                    <div className="space-y-4 mb-6">
                      {selectedFile.questions.map((q, index) => (
                        <div key={q.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                            Q{index + 1}: {q.question}
                          </h4>
                          <ul className="list-disc list-inside space-y-1 ml-4">
                            {q.options.map((option, optIndex) => (
                              <li
                                key={optIndex}
                                className={`text-sm ${
                                  optIndex === q.correctAnswer
                                    ? "text-green-600 dark:text-green-400 font-semibold"
                                    : "text-gray-600 dark:text-gray-400"
                                }`}
                              >
                                {String.fromCharCode(65 + optIndex)}. {option}
                                {optIndex === q.correctAnswer && " ✓"}
                              </li>
                            ))}
                          </ul>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 italic">
                            {q.explanation}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* JSON Data */}
                    <div className="mt-6">
                      <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">JSON Data:</h4>
                      <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-xs">
                        {JSON.stringify(selectedFile.questions, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 p-12 rounded-lg shadow text-center">
                <FiFileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  Select a file to view summary, flowchart, and questions
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
