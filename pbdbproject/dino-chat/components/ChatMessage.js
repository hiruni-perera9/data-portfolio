import Image from 'next/image';
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const components = {
  h1: props => <h1 className="text-xl font-bold text-slate-100 mt-4 mb-2" {...props} />,
  h2: props => <h2 className="text-lg font-semibold text-slate-100 mt-4 mb-2" {...props} />,
  h3: props => <h3 className="text-base font-semibold text-slate-200 mt-3 mb-2" {...props} />,
  p: props => <p className="mb-3 leading-relaxed text-white/90" {...props} />,
  ul: props => <ul className="list-disc list-inside space-y-1 mb-3 text-white/90" {...props} />,
  ol: props => <ol className="list-decimal list-inside space-y-1 mb-3 text-white/90" {...props} />,
  li: props => <li className="leading-relaxed" {...props} />,
  strong: props => <strong className="font-semibold text-slate-100" {...props} />,
  em: props => <em className="text-slate-200" {...props} />,
  hr: props => <hr className="my-4 border-slate-600/50" {...props} />,
  table: props => <div className="overflow-x-auto mb-4">
      <table className="w-full text-sm text-left border-collapse border border-slate-700/70" {...props} />
    </div>,
  th: props => <th className="border border-slate-700/70 px-3 py-2 bg-slate-800/80 text-slate-100 font-semibold" {...props} />,
  td: props => <td className="border border-slate-700/70 px-3 py-2 text-slate-200" {...props} />    
};


 
export function ChatMessage({ message }) {
  const { role, content, mode, detectedDinosaur, paleoData } = message;

  if (role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] bg-gradient-to-br from-slate-600 to-slate-700 text-white rounded-2xl p-4 shadow-lg">
          <p className="leading-relaxed">{content}</p>
        </div>
      </div>
    );
  }

 
  return (
    <div className="flex justify-start">
      <div className="max-w-[85%]">
        {/* Header with avatar and metadata */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-800 shadow-lg">
            <Image
              src="/images/logo-trans.png"
              alt="Paleo AI"
              width={24}
              height={24}
              className="object-cover"
            />
          </div>
          <div>
            <div className="text-white font-semibold text-sm">Paleo AI Assistant</div>
            <div className="flex items-center gap-2 text-xs text-white/60">
              <span>{mode === 'technical' ? '🔬 Technical Mode' : '🎓 Educational Mode'}</span>
              {detectedDinosaur && (
                <>
                  <span>•</span>
                  <span>🦕 {detectedDinosaur}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* PaleoDB Data Card */}
        {paleoData?.taxa && (
          <div className="mb-3 bg-gradient-to-br from-slate-700/40 to-slate-800/40 backdrop-blur-xl border border-slate-600/50 rounded-2xl p-5 shadow-lg">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <h4 className="text-white font-bold text-lg">{paleoData.taxa.nam}</h4>
                  <span className="text-xs bg-slate-500/20 border border-emerald-500/40 text-emerald-400 px-2 py-0.5 rounded-full font-medium">
                    PaleoDB Verified
                  </span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {paleoData.taxa.rnk && (
                    <div className="bg-black/20 rounded-lg p-3">
                      <span className="text-white/50 text-xs uppercase tracking-wider block mb-1">Rank</span>
                      <span className="text-white font-medium">{paleoData.taxa.rnk}</span>
                    </div>
                  )}

                  {paleoData.taxa.att && (
                    <div className="bg-black/20 rounded-lg p-3">
                      <span className="text-white/50 text-xs uppercase tracking-wider block mb-1">Named by</span>
                      <span className="text-white font-medium">{paleoData.taxa.att}</span>
                    </div>
                  )}
                  
                  {(paleoData.taxa.fea || paleoData.taxa.lla) && (
                    <div className="bg-black/20 rounded-lg p-3">
                      <span className="text-white/50 text-xs uppercase tracking-wider block mb-1">Age Range</span>
                      <span className="text-white font-medium">
                        {paleoData.taxa.fea && paleoData.taxa.lla ? `${paleoData.taxa.fea} – ${paleoData.taxa.lla} million years ago`: paleoData.taxa.fea || paleoData.taxa.lla}
                      </span> 
                    </div>
                  )}
                  
                  {(paleoData.taxa.tei || paleoData.taxa.tli) && (
                    <div className="bg-black/20 rounded-lg p-3">
                      <span className="text-white/50 text-xs uppercase tracking-wider block mb-1">Geological Interval</span>
                      <span className="text-white font-medium">
                        {paleoData.taxa.tei}
                        {paleoData.taxa.tei && paleoData.taxa.tli && ' → '}
                        {paleoData.taxa.tli}
                      </span>
                    </div>
                  )}
                  
                  {/* Classification chain */}
                  {(paleoData.taxa.phl ||
                    paleoData.taxa.cll ||
                    paleoData.taxa.fml ||
                    paleoData.taxa.gnl) && (
                    <div className="bg-black/20 rounded-lg p-3 sm:col-span-2">
                      <span className="text-white/50 text-xs uppercase tracking-wider block mb-1">
                        Classification
                      </span>
                      <span className="text-white font-medium italic">
                        {[
                          paleoData.taxa.phl,   // phylum
                          paleoData.taxa.cll,   // clade/class
                          paleoData.taxa.fml,   // family
                          paleoData.taxa.gnl    // genus
                        ]
                          .filter(Boolean)
                          .join(' › ')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-gradient-to-br from-slate-700 to-slate-800 backdrop-blur-xl border border-white/20 rounded-2xl p-5 text-white shadow-lg">
          <div className="prose prose-invert max-w-none">
            {formatContent(content)}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 mt-3 ml-2">
          <button 
            className="text-white/60 hover:text-white text-xs flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-white/10 transition-all"
            onClick={() => navigator.clipboard.writeText(content)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
            </svg>
            <span>Copy</span>
          </button>
          
          <button className="text-white/60 hover:text-white text-xs flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-white/10 transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z" />
            </svg>
            <span>Helpful</span>
          </button>

          <button className="text-white/60 hover:text-white text-xs flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-white/10 transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
            </svg>
            <span>Save</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// Format content with enhanced typography
function formatContent(text) {
  return (
    <div className="bg-slate-800 backdrop-blur-xl border border-white/20 rounded-2xl p-5 text-white shadow-lg">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {text}
      </ReactMarkdown>
    </div>
  );
}

// Highlight text between ** ** and make it bold (no markers shown)
function highlightTerms(text) {
  const parts = [];
  const boldRegex = /\*\*(.+?)\*\*/g; // matches **something**
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = boldRegex.exec(text)) !== null) {
    const matchStart = match.index;
    const matchEnd = match.index + match[0].length;

    // Text before the **bold** part
    if (matchStart > lastIndex) {
      parts.push(
        <span key={key++}>
          {text.slice(lastIndex, matchStart)}
        </span>
      );
    }

    // The bold part itself (without the **)
    parts.push(
      <span
        key={key++}
        className="font-bold text-slate-200"
      >
        {match[1]}
      </span>
    );

    lastIndex = matchEnd;
  }

  // Any remaining text after the last **bold**
  if (lastIndex < text.length) {
    parts.push(
      <span key={key++}>
        {text.slice(lastIndex)}
      </span>
    );
  }

  return parts;
}