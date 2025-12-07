import { useState } from "react";

function App() {
  const [content, setContent] = useState("");
  const [settings, setSettings] = useState({
    font: "Times-Roman",
    fontSize: 12,
    lineSpacing: 1.5,
  });
  const [isPreview, setIsPreview] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const [isFormatting, setIsFormatting] = useState(false);

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

      if (upper.startsWith("CHAPTER") || upper === "REFERENCES") {
        textAlign = "center";
        fontWeight = "bold";
      }

      const parts = line.split(/(_[^_]+_|\*[^*]+\*)/g);
      return (
        <div key={index} style={{ textAlign, fontWeight, minHeight: "1em" }}>
          {parts.map((part, i) => {
            if (part.startsWith("_") && part.endsWith("_"))
              return <i key={i}>{part.slice(1, -1)}</i>;
            if (part.startsWith("*") && part.endsWith("*"))
              return <b key={i}>{part.slice(1, -1)}</b>;
            return <span key={i}>{part}</span>;
          })}
        </div>
      );
    });
  };

  const downloadPDF = async () => {
    alert("PDF download would connect to your backend at localhost:5000");
  };

  return (
    <div style={styles.container}>
      {/* Premium Toolbar */}
      <div style={styles.toolbar}>
        <div style={styles.toolbarContent}>
          <div style={styles.brandSection}>
            <img src="/lDraft.png" alt="iDraft Logo" style={styles.logo} />
            <div>
              <div style={styles.brand}>iDraft</div>
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
            onClick={downloadPDF}
            style={styles.downloadBtn}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 6px 20px rgba(68, 119, 148, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 4px 12px rgba(68, 119, 148, 0.3)";
            }}
          >
            <span style={styles.downloadIcon}>📥</span>
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {/* Workspace */}
      <div style={styles.workspace}>
        <div style={styles.paperContainer}>
          {/* Tab Toggle */}
          <div style={styles.modeToggle}>
            <button
              style={{
                ...styles.modeBtn,
                ...(!isPreview ? styles.activeTab : {}),
              }}
              onClick={() => setIsPreview(false)}
              onMouseEnter={(e) => {
                if (isPreview) e.target.style.color = "#447794";
              }}
              onMouseLeave={(e) => {
                if (isPreview) e.target.style.color = "#6b7280";
              }}
            >
              <span style={styles.tabIcon}>✏️</span>
              <span>Edit</span>
            </button>
            <button
              style={{
                ...styles.modeBtn,
                ...(isPreview ? styles.activeTab : {}),
              }}
              onClick={() => setIsPreview(true)}
              onMouseEnter={(e) => {
                if (!isPreview) e.target.style.color = "#447794";
              }}
              onMouseLeave={(e) => {
                if (!isPreview) e.target.style.color = "#6b7280";
              }}
            >
              <span style={styles.tabIcon}>👁️</span>
              <span>Preview</span>
            </button>
          </div>

          {/* Content Area */}
          {isPreview ? (
            <div
              style={{
                ...styles.previewBox,
                fontFamily: getPreviewFontFamily(),
                fontSize: `${settings.fontSize}px`,
                lineHeight: settings.lineSpacing,
              }}
            >
              {content ? (
                renderPreviewContent()
              ) : (
                <div style={styles.placeholder}>
                  Switch to Edit mode to start typing...
                </div>
              )}
            </div>
          ) : (
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
          )}
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
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    width: "100vw",
    backgroundColor: "#061222",
    overflow: "hidden",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },

  // Toolbar Styles
  toolbar: {
    background: "linear-gradient(135deg, #061222 0%, #0a1a2e 100%)",
    borderBottom: "1px solid rgba(68, 119, 148, 0.3)",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.5)",
    padding: "16px 24px",
    zIndex: 100,
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
    display: "flex", // Add this
    alignItems: "center", // Add this
    gap: "12px", // Add this
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

  logo: {
    height: "40px",
    width: "auto",
    marginRight: "12px",
    objectFit: "contain",
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
    position: "relative",
    overflow: "hidden",
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

  // Workspace Styles
  workspace: {
    flex: 1,
    backgroundColor: "#061222",
    overflow: "auto",
    display: "flex",
    justifyContent: "center",
    padding: "40px 20px",
    position: "relative",
  },

  paperContainer: {
    width: "210mm",
    maxWidth: "100%",
    minHeight: "297mm",
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    boxShadow:
      "0 20px 60px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(68, 119, 148, 0.1)",
    padding: "25mm",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    animation: "fadeInUp 0.5s ease-out",
  },

  // Tab Styles
  modeToggle: {
    display: "flex",
    marginBottom: "24px",
    borderBottom: "2px solid #e5e7eb",
    gap: "8px",
  },
  modeBtn: {
    background: "transparent",
    border: "none",
    padding: "12px 20px",
    fontSize: "15px",
    cursor: "pointer",
    fontWeight: "600",
    color: "#6b7280",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    transition: "all 0.3s ease",
    borderRadius: "6px 6px 0 0",
    position: "relative",
  },
  activeTab: {
    color: "#061222",
    background:
      "linear-gradient(to bottom, transparent, rgba(68, 119, 148, 0.05))",
    borderBottom: "3px solid #447794",
    marginBottom: "-2px",
  },
  tabIcon: {
    fontSize: "16px",
  },

  // Editor Styles
  editor: {
    flex: 1,
    width: "100%",
    minHeight: "600px",
    border: "none",
    outline: "none",
    resize: "none",
    backgroundColor: "transparent",
    color: "#061222",
    whiteSpace: "pre-wrap",
    padding: "16px",
    borderRadius: "8px",
    transition: "background-color 0.3s ease",
  },

  previewBox: {
    width: "100%",
    minHeight: "600px",
    whiteSpace: "pre-wrap",
    color: "#061222",
    padding: "16px",
    borderRadius: "8px",
  },

  placeholder: {
    color: "#9ca3af",
    fontStyle: "italic",
    textAlign: "center",
    padding: "60px 20px",
    fontSize: "16px",
  },

  // WhatsApp Banner
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
    backdropFilter: "blur(10px)",
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
};

// Add CSS animations
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

  @media (max-width: 768px) {
    /* Mobile adjustments applied via inline styles */
  }
`;
document.head.appendChild(styleSheet);

export default App;
