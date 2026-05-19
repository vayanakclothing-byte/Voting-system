import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { FaTimes, FaMobileAlt } from 'react-icons/fa';

interface QRModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QRModal: React.FC<QRModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  // The voting URL (current origin)
  const votingUrl = window.location.origin;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="glass-panel bg-slate-900/90 border border-slate-700/80 rounded-3xl max-w-md w-full p-6 relative shadow-2xl shadow-indigo-500/10 text-center animate-scaleUp">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors border border-slate-700"
        >
          <FaTimes />
        </button>

        {/* Header */}
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-4 border border-indigo-500/30 text-2xl">
          <FaMobileAlt />
        </div>
        <h2 className="text-xl font-bold text-white mb-1">Smart Board & Mobile Voting</h2>
        <p className="text-xs text-slate-400 mb-6 max-w-xs mx-auto">
          Scan this QR code with any mobile device or tablet in the computer lab to open the live election portal instantly.
        </p>

        {/* QR Code Container */}
        <div className="bg-white p-6 rounded-2xl shadow-xl inline-block mb-6 border border-slate-200">
          <QRCodeSVG
            value={votingUrl}
            size={220}
            bgColor={"#ffffff"}
            fgColor={"#0f172a"}
            level={"H"}
            includeMargin={false}
          />
        </div>

        {/* URL display */}
        <div className="bg-slate-800/80 py-2 px-4 rounded-xl border border-slate-700/80 mb-6 flex items-center justify-between gap-2 max-w-xs mx-auto">
          <span className="text-xs font-mono text-slate-300 truncate">{votingUrl}</span>
          <button
            onClick={() => {
              navigator.clipboard.writeText(votingUrl);
              alert('Voting link copied to clipboard!');
            }}
            className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-2.5 py-1 rounded-lg font-medium transition-colors shrink-0"
          >
            Copy
          </button>
        </div>

        {/* Footer */}
        <p className="text-xs text-amber-400/90 font-medium">
          🔒 Secure 256-bit encrypted lab voting session
        </p>
      </div>
    </div>
  );
};
