import { Link } from 'react-router-dom';
import { Share, Trash2 } from 'lucide-react';
import { type JournalEntry, useJournalStore } from '../store/journalStore';

interface JournalCardProps {
  entry: JournalEntry;
}

const moodGradients: Record<string, string> = {
  '😄': 'bg-gradient-to-br from-amber-200 to-orange-400',
  '😌': 'bg-gradient-to-br from-sky-200 to-indigo-400',
  '🤔': 'bg-gradient-to-br from-purple-200 to-fuchsia-400',
  '😴': 'bg-gradient-to-br from-slate-300 to-slate-500',
  '😤': 'bg-gradient-to-br from-rose-300 to-red-500',
};

const defaultGradient = 'bg-gradient-to-br from-indigo-100 to-purple-200';

export default function JournalCard({ entry }: JournalCardProps) {
  const deleteEntry = useJournalStore(state => state.deleteEntry);
  
  const coverGradient = entry.mood ? (moodGradients[entry.mood] || defaultGradient) : defaultGradient;
  const hasImage = entry.media && entry.media.length > 0;
  const coverUrl = hasImage ? entry.media![0] : null;

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this entry?')) {
      deleteEntry(entry.id);
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Simulate share action
    alert('Share functionality coming soon!');
  };

  const formattedDate = new Date(entry.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <Link to={`/entry/${entry.id}`} className="group relative flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-md hover:border-slate-200 transition-all duration-300 h-[280px]">
      
      {/* Quick Actions (Hover) */}
      <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button 
          onClick={handleShare}
          className="w-8 h-8 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-full text-slate-500 hover:text-indigo-600 hover:bg-white shadow-sm transition-colors"
          title="Share"
        >
          <Share size={14} />
        </button>
        <button 
          onClick={handleDelete}
          className="w-8 h-8 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-full text-slate-500 hover:text-rose-600 hover:bg-white shadow-sm transition-colors"
          title="Delete"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Cover Image / Gradient */}
      <div className={`h-36 w-full shrink-0 relative overflow-hidden ${!hasImage ? coverGradient : 'bg-slate-100'}`}>
        {hasImage && (
           <img src={coverUrl!} alt={entry.title || "Journal entry cover"} className="w-full h-full object-cover" />
        )}
        {entry.mood && !hasImage && (
           <div className="absolute inset-0 flex items-center justify-center text-4xl opacity-50 mix-blend-overlay">
               {entry.mood}
           </div>
        )}
      </div>

      {/* Content Area */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-2">
           <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
              {formattedDate}
           </span>
           {entry.mood && (
              <span className="text-lg leading-none" title="Mood">{entry.mood}</span>
           )}
        </div>
        
        <h3 className="text-lg font-bold text-slate-800 mb-2 truncate">
           {entry.title || 'Untitled Entry'}
        </h3>
        
        <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
           {entry.content || 'No content written yet...'}
        </p>
      </div>
    </Link>
  );
}
