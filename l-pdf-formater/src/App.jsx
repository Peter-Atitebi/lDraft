import { useState, useRef, useEffect } from "react";

function App() {
  const [content, setContent] = useState("");
  const [settings, setSettings] = useState({
    font: "Times-Roman",
    fontSize: 12,
    lineSpacing: 1.5,
  });
  const [showBanner, setShowBanner] = useState(true);
  const [isFormatting, setIsFormatting] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuTimerRef = useRef(null);
  const [menuButtonPos, setMenuButtonPos] = useState({ top: 20, left: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  const handleDragStart = (e) => {
    setIsDragging(true);
    const clientX = e.type === "touchstart" ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === "touchstart" ? e.touches[0].clientY : e.clientY;
    dragStartRef.current = {
      x: clientX - menuButtonPos.left,
      y: clientY - menuButtonPos.top,
    };
  };

  const handleDragMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const clientX = e.type === "touchmove" ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === "touchmove" ? e.touches[0].clientY : e.clientY;

    const newLeft = Math.max(
      10,
      Math.min(window.innerWidth - 60, clientX - dragStartRef.current.x)
    );
    const newTop = Math.max(
      10,
      Math.min(window.innerHeight - 60, clientY - dragStartRef.current.y)
    );

    setMenuButtonPos({ top: newTop, left: newLeft });
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleDragMove);
      window.addEventListener("mouseup", handleDragEnd);
      window.addEventListener("touchmove", handleDragMove);
      window.addEventListener("touchend", handleDragEnd);

      return () => {
        window.removeEventListener("mousemove", handleDragMove);
        window.removeEventListener("mouseup", handleDragEnd);
        window.removeEventListener("touchmove", handleDragMove);
        window.removeEventListener("touchend", handleDragEnd);
      };
    }
  }, [isDragging]);

  const openMenu = () => {
    setShowMenu(true);
    if (menuTimerRef.current) {
      clearTimeout(menuTimerRef.current);
    }
    menuTimerRef.current = setTimeout(() => {
      setShowMenu(false);
    }, 20000);
  };

  const closeMenu = () => {
    setShowMenu(false);
    if (menuTimerRef.current) {
      clearTimeout(menuTimerRef.current);
    }
  };

  useEffect(() => {
    return () => {
      if (menuTimerRef.current) {
        clearTimeout(menuTimerRef.current);
      }
    };
  }, []);

  const sanitizeText = (text) => {
    if (!text) return "";
    return text
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/[\u2013\u2014]/g, "-")
      .replace(/…/g, "...")
      .replace(/•/g, "-")
      .replace(/\t/g, "    ")
      .replace(/[^\x00-\x7F]/g, "");
  };

  const applyAutoFormat = () => {
    setIsFormatting(true);
    setTimeout(() => {
      let text = content;
      text = text.replace(/([^_])et al\.([^_])/g, "$1_et al._$2");
      text = text.replace(/^et al\./gm, "_et al._");
      setContent(text);
      setSettings({ font: "Times-Roman", fontSize: 12, lineSpacing: 1.5 });
      setIsFormatting(false);
      alert("APA formatting applied successfully");
    }, 300);
  };

  const getPreviewFontFamily = () => {
    switch (settings.font) {
      case "Times-Roman":
        return '"Times New Roman", Times, serif';
      case "Helvetica":
        return "Arial, Helvetica, sans-serif";
      default:
        return "serif";
    }
  };

  const renderPreviewContent = () => {
    return content.split("\n").map((line, index) => {
      const cleanLine = line.trim();
      if (!cleanLine) return <div key={index} style={{ height: "1em" }}></div>;

      const upper = cleanLine.toUpperCase();
      let textAlign = "left";
      let fontWeight = "normal";
      let showPageBreak = false;

      if (upper.startsWith("CHAPTER") || upper === "REFERENCES") {
        textAlign = "center";
        fontWeight = "bold";
        showPageBreak = index > 0;
      }

      const parts = line.split(/(_[^_]+_|\*[^*]+\*)/g);
      return (
        <div key={index}>
          {showPageBreak && (
            <div style={styles.pageBreak}>
              <div style={styles.pageBreakLine}></div>
              <span style={styles.pageBreakText}>Page Break</span>
              <div style={styles.pageBreakLine}></div>
            </div>
          )}
          <div style={{ textAlign, fontWeight, minHeight: "1em" }}>
            {parts.map((part, i) => {
              if (part.startsWith("_") && part.endsWith("_"))
                return <i key={i}>{part.slice(1, -1)}</i>;
              if (part.startsWith("*") && part.endsWith("*"))
                return <b key={i}>{part.slice(1, -1)}</b>;
              return <span key={i}>{part}</span>;
            })}
          </div>
        </div>
      );
    });
  };

  const downloadPDF = async () => {
    try {
      const cleanContent = sanitizeText(content);

      const response = await axios.post(
        "http://localhost:5000/create-pdf",
        { content: cleanContent, settings },
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "project.pdf");
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error(error);
      alert("Server Error. Check if backend is running.");
    }
  };

  return (
    <div style={styles.container}>
      {/* Menu Button */}
      <button
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
        onClick={(e) => {
          if (!isDragging) openMenu();
        }}
        style={{
          ...styles.menuButton,
          top: `${menuButtonPos.top}px`,
          left: `${menuButtonPos.left}px`,
          cursor: isDragging ? "grabbing" : "grab",
        }}
        onMouseEnter={(e) => {
          if (!isDragging) {
            e.target.style.background =
              "linear-gradient(135deg, #5b90b1 0%, #447794 100%)";
          }
        }}
        onMouseLeave={(e) => {
          e.target.style.background =
            "linear-gradient(135deg, #447794 0%, #5b90b1 100%)";
        }}
      >
        ☰
      </button>

      {/* Toolbar Menu */}
      {showMenu && (
        <div style={styles.menuOverlay} onClick={closeMenu}>
          <div style={styles.toolbar} onClick={(e) => e.stopPropagation()}>
            <button
              onClick={closeMenu}
              style={styles.closeMenuBtn}
              onMouseEnter={(e) => {
                e.target.style.background = "rgba(255, 255, 255, 0.2)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "rgba(255, 255, 255, 0.1)";
              }}
            >
              ✕
            </button>

            <div style={styles.toolbarContent}>
              <div style={styles.brandSection}>
                <img src="/lDraft.png" alt="lDraft Logo" style={styles.logo} />
                <div>
                  <div style={styles.brand}>lDraft</div>
                  <div style={styles.brandSubtitle}>APA Format Assistant</div>
                </div>
              </div>

              <div style={styles.controls}>
                <button
                  onClick={applyAutoFormat}
                  style={{
                    ...styles.magicBtn,
                    ...(isFormatting ? styles.magicBtnActive : {}),
                  }}
                  onMouseEnter={(e) => {
                    if (!isFormatting)
                      e.target.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "translateY(0)";
                  }}
                >
                  <span style={styles.icon}>✨</span>
                  <span style={styles.buttonText}>Auto-Format APA</span>
                </button>

                <div style={styles.divider}></div>

                <div style={styles.settingsGroup}>
                  <select
                    value={settings.font}
                    onChange={(e) =>
                      setSettings({ ...settings, font: e.target.value })
                    }
                    style={styles.select}
                  >
                    <option value="Times-Roman">Times New Roman</option>
                    <option value="Helvetica">Arial</option>
                  </select>

                  <input
                    type="number"
                    value={settings.fontSize}
                    onChange={(e) =>
                      setSettings({ ...settings, fontSize: e.target.value })
                    }
                    style={styles.sizeInput}
                    min="8"
                    max="72"
                  />

                  <select
                    value={settings.lineSpacing}
                    onChange={(e) =>
                      setSettings({ ...settings, lineSpacing: e.target.value })
                    }
                    style={styles.select}
                  >
                    <option value="1.0">1.0</option>
                    <option value="1.5">1.5</option>
                    <option value="2.0">2.0</option>
                  </select>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowPreviewModal(true);
                  closeMenu();
                }}
                style={styles.previewBtn}
                onMouseEnter={(e) => {
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow =
                    "0 6px 20px rgba(68, 119, 148, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow =
                    "0 4px 12px rgba(68, 119, 148, 0.3)";
                }}
              >
                <span style={styles.tabIcon}>👁️</span>
                <span>Preview</span>
              </button>

              <button
                onClick={downloadPDF}
                style={styles.downloadBtn}
                onMouseEnter={(e) => {
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow =
                    "0 6px 20px rgba(68, 119, 148, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow =
                    "0 4px 12px rgba(68, 119, 148, 0.3)";
                }}
              >
                <span style={styles.downloadIcon}>📥</span>
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Workspace */}
      <div style={styles.workspace}>
        <div style={styles.paperContainer}>
          <textarea
            style={{
              ...styles.editor,
              fontFamily: getPreviewFontFamily(),
              fontSize: `${settings.fontSize}px`,
              lineHeight: settings.lineSpacing,
            }}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start typing or paste your entire project here..."
          />
        </div>
      </div>

      {/* WhatsApp Banner */}
      {showBanner && (
        <div style={styles.whatsappBanner}>
          <button
            style={styles.closeBtn}
            onClick={() => setShowBanner(false)}
            onMouseEnter={(e) => {
              e.target.style.transform = "scale(1.1)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "scale(1)";
            }}
          >
            ✕
          </button>
          <div style={styles.bannerContent}>
            <span style={styles.bannerIcon}>📢</span>
            <span style={styles.bannerText}>
              Follow the Lithora channel on WhatsApp:{" "}
              <a
                href="https://whatsapp.com/channel/0029Vb7GsVZAe5Vh3fgjr50j"
                target="_blank"
                rel="noopener noreferrer"
                style={styles.bannerLink}
              >
                Follow channel
              </a>
            </span>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && (
        <div style={styles.previewModal}>
          <div style={styles.previewModalHeader}>
            <div style={styles.previewModalTitle}>
              <span style={styles.previewModalIcon}>📄</span>
              <span>Document Preview</span>
            </div>
            <button
              style={styles.previewModalClose}
              onClick={() => setShowPreviewModal(false)}
              onMouseEnter={(e) => {
                e.target.style.background = "rgba(255, 255, 255, 0.2)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "rgba(255, 255, 255, 0.1)";
              }}
            >
              ✕
            </button>
          </div>
          <div style={styles.previewModalContent}>
            <div style={styles.previewModalPaper}>
              <div
                style={{
                  fontFamily: getPreviewFontFamily(),
                  fontSize: `${settings.fontSize}px`,
                  lineHeight: settings.lineSpacing,
                  color: "#061222",
                }}
              >
                {content ? (
                  renderPreviewContent()
                ) : (
                  <div style={styles.placeholder}>
                    No content to preview. Start typing in the editor!
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    width: "100vw",
    backgroundColor: "#ffffff",
    overflow: "hidden",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },

  menuButton: {
    position: "fixed",
    background: "linear-gradient(135deg, #447794 0%, #5b90b1 100%)",
    color: "#ffffff",
    border: "none",
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    fontSize: "24px",
    boxShadow: "0 4px 15px rgba(68, 119, 148, 0.4)",
    zIndex: 1001,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background 0.3s ease",
    userSelect: "none",
    touchAction: "none",
  },

  menuOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 2000,
    animation: "fadeIn 0.3s ease-out",
  },

  toolbar: {
    background: "linear-gradient(135deg, #061222 0%, #0a1a2e 100%)",
    borderBottom: "1px solid rgba(68, 119, 148, 0.3)",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.5)",
    padding: "16px 24px",
    animation: "slideDown 0.3s ease-out",
    position: "relative",
  },

  closeMenuBtn: {
    position: "absolute",
    top: "16px",
    right: "24px",
    background: "rgba(255, 255, 255, 0.1)",
    border: "none",
    color: "#ffffff",
    fontSize: "24px",
    fontWeight: "bold",
    cursor: "pointer",
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.3s ease",
  },

  toolbarContent: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    flexWrap: "wrap",
    maxWidth: "1400px",
    margin: "0 auto",
  },

  brandSection: {
    marginRight: "auto",
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  logo: {
    height: "40px",
    width: "auto",
    objectFit: "contain",
  },

  brand: {
    fontSize: "28px",
    fontWeight: "800",
    background: "linear-gradient(135deg, #ffffff 0%, #447794 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    letterSpacing: "-0.5px",
  },

  brandSubtitle: {
    fontSize: "11px",
    color: "#447794",
    fontWeight: "500",
    letterSpacing: "1px",
    textTransform: "uppercase",
    marginTop: "2px",
  },

  controls: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    flexWrap: "wrap",
  },

  magicBtn: {
    background: "linear-gradient(135deg, #447794 0%, #5b90b1 100%)",
    color: "#ffffff",
    border: "none",
    padding: "12px 24px",
    borderRadius: "10px",
    fontWeight: "700",
    fontSize: "14px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    boxShadow: "0 4px 15px rgba(68, 119, 148, 0.4)",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  },

  magicBtnActive: {
    animation: "pulse 0.6s ease-in-out",
  },

  icon: {
    fontSize: "16px",
    animation: "sparkle 2s ease-in-out infinite",
  },

  buttonText: {
    whiteSpace: "nowrap",
  },

  divider: {
    width: "1px",
    height: "32px",
    background: "rgba(68, 119, 148, 0.3)",
  },

  settingsGroup: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
  },

  select: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    color: "#061222",
    border: "2px solid rgba(68, 119, 148, 0.3)",
    padding: "10px 14px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.3s ease",
    outline: "none",
  },

  sizeInput: {
    width: "70px",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    color: "#061222",
    border: "2px solid rgba(68, 119, 148, 0.3)",
    padding: "10px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    textAlign: "center",
    outline: "none",
    transition: "all 0.3s ease",
  },

  previewBtn: {
    background: "linear-gradient(135deg, #447794 0%, #5b90b1 100%)",
    color: "#ffffff",
    border: "none",
    padding: "12px 28px",
    borderRadius: "10px",
    fontWeight: "700",
    fontSize: "14px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    boxShadow: "0 4px 12px rgba(68, 119, 148, 0.3)",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    whiteSpace: "nowrap",
  },

  downloadBtn: {
    background: "linear-gradient(135deg, #447794 0%, #5b90b1 100%)",
    color: "#ffffff",
    border: "none",
    padding: "12px 28px",
    borderRadius: "10px",
    fontWeight: "700",
    fontSize: "14px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    boxShadow: "0 4px 12px rgba(68, 119, 148, 0.3)",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    whiteSpace: "nowrap",
  },

  downloadIcon: {
    fontSize: "18px",
  },

  tabIcon: {
    fontSize: "16px",
  },

  workspace: {
    flex: 1,
    backgroundColor: "#ffffff",
    overflow: "hidden",
    display: "flex",
    justifyContent: "center",
    padding: "0",
  },

  paperContainer: {
    width: "100%",
    maxWidth: "100%",
    height: "100%",
    backgroundColor: "#ffffff",
    padding: "16px",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },

  editor: {
    flex: 1,
    width: "100%",
    height: "100%",
    border: "none",
    outline: "none",
    resize: "none",
    backgroundColor: "transparent",
    color: "#061222",
    whiteSpace: "pre-wrap",
    padding: "0",
    transition: "background-color 0.3s ease",
    overflowY: "auto",
  },

  placeholder: {
    color: "#9ca3af",
    fontStyle: "italic",
    textAlign: "center",
    padding: "60px 20px",
    fontSize: "16px",
  },

  whatsappBanner: {
    position: "fixed",
    bottom: "24px",
    right: "24px",
    left: "24px",
    maxWidth: "500px",
    margin: "0 auto",
    background: "linear-gradient(135deg, #447794 0%, #5b90b1 100%)",
    borderRadius: "12px",
    padding: "16px 20px",
    boxShadow: "0 8px 32px rgba(68, 119, 148, 0.4)",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    zIndex: 1000,
    animation: "slideInUp 0.5s ease-out",
  },

  closeBtn: {
    background: "rgba(255, 255, 255, 0.2)",
    border: "none",
    color: "#ffffff",
    fontSize: "18px",
    fontWeight: "bold",
    cursor: "pointer",
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.3s ease",
    flexShrink: 0,
  },

  bannerContent: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flex: 1,
  },

  bannerIcon: {
    fontSize: "20px",
    flexShrink: 0,
  },

  bannerText: {
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: "500",
    lineHeight: "1.5",
  },

  bannerLink: {
    color: "#061222",
    textDecoration: "none",
    fontWeight: "700",
    padding: "2px 8px",
    background: "rgba(255, 255, 255, 0.9)",
    borderRadius: "4px",
    transition: "all 0.3s ease",
    display: "inline-block",
    marginLeft: "4px",
  },

  previewModal: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#061222",
    zIndex: 2000,
    display: "flex",
    flexDirection: "column",
    animation: "fadeIn 0.3s ease-out",
  },

  previewModalHeader: {
    background: "linear-gradient(135deg, #061222 0%, #0a1a2e 100%)",
    padding: "16px 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: "1px solid rgba(68, 119, 148, 0.3)",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.5)",
  },

  previewModalTitle: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    color: "#ffffff",
    fontSize: "18px",
    fontWeight: "700",
  },

  previewModalIcon: {
    fontSize: "24px",
  },

  previewModalClose: {
    background: "rgba(255, 255, 255, 0.1)",
    border: "none",
    color: "#ffffff",
    fontSize: "24px",
    fontWeight: "bold",
    cursor: "pointer",
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.3s ease",
  },

  previewModalContent: {
    flex: 1,
    overflow: "auto",
    padding: "0",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    backgroundColor: "#061222",
  },

  previewModalPaper: {
    width: "100%",
    maxWidth: "100%",
    minHeight: "100vh",
    backgroundColor: "#ffffff",
    padding: "16px",
    boxShadow: "none",
    boxSizing: "border-box",
    margin: "0",
  },

  pageBreak: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    margin: "40px 0",
    padding: "20px 0",
  },

  pageBreakLine: {
    flex: 1,
    height: "2px",
    background: "linear-gradient(to right, transparent, #447794, transparent)",
  },

  pageBreakText: {
    color: "#447794",
    fontSize: "12px",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "1px",
    padding: "4px 12px",
    background: "rgba(68, 119, 148, 0.1)",
    borderRadius: "4px",
    border: "1px dashed #447794",
  },
};

const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideInUp {
    from {
      opacity: 0;
      transform: translateY(100px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes sparkle {
    0%, 100% { transform: scale(1) rotate(0deg); }
    50% { transform: scale(1.2) rotate(180deg); }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes slideDown {
    from {
      transform: translateY(-100%);
    }
    to {
      transform: translateY(0);
    }
  }
`;
document.head.appendChild(styleSheet);

export default App;
