import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Filter, BookHeart } from 'lucide-react';
import { useJournalStore } from '../store/journalStore';
import JournalCard from '../components/JournalCard';

export default function JournalListPage() {
  const navigate = useNavigate();
  const entriesMap = useJournalStore(state => state.entries);
  const fetchEntries = useJournalStore(state => state.fetchEntries);
  const isLoading = useJournalStore(state => state.isLoading);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [moodFilter, setMoodFilter] = useState<string>('all');

  // Fetch entries from backend on mount
  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);
  
  // Convert map to array and sort by newest first
  const allEntries = useMemo(() => {
    return Object.values(entriesMap).sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [entriesMap]);

  // Apply filters
  const filteredEntries = useMemo(() => {
    return allEntries.filter(entry => {
      const matchesSearch = 
        (entry.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) || 
        (entry.content?.toLowerCase() || '').includes(searchQuery.toLowerCase());
        
      const matchesMood = moodFilter === 'all' || entry.mood === moodFilter;
      
      return matchesSearch && matchesMood;
    });
  }, [allEntries, searchQuery, moodFilter]);

  const availableMoods = ['all', '😄', '😌', '🤔', '😴', '😤'];

  if (isLoading && allEntries.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center h-full bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-500">Loading your journal...</p>
        </div>
      </div>
    );
  }

  if (allEntries.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center h-full bg-[#F8FAFC]">
        <div className="flex flex-col items-center max-w-md text-center">
          <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-500 mb-6 shadow-sm">
            <BookHeart size={48} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-3">Your Journal Awaits</h2>
          <p className="text-slate-500 mb-8 leading-relaxed">
            A quiet space to reflect, track your finances, and capture the moments that matter. Start your journaling journey today.
          </p>
          <button 
            onClick={() => navigate('/new')}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-[0_8px_16px_-4px_rgba(99,102,241,0.4)] active:scale-95"
          >
            <Plus size={20} />
            Create First Entry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 h-full bg-[#F8FAFC] overflow-hidden">
      {/* Header & Controls */}
      <div className="px-10 py-8 shrink-0 flex flex-col gap-6 bg-white border-b border-slate-100 z-10 shadow-sm">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-1">Journal</h1>
            <p className="text-sm font-medium text-slate-500">{allEntries.length} entries total</p>
          </div>
          <button 
            onClick={() => navigate('/new')}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-[0_4px_12px_rgba(99,102,241,0.3)]"
          >
            <Plus size={18} />
            New Entry
          </button>
        </div>

        <div className="flex items-center gap-4">
           {/* Search Bar */}
           <div className="relative flex-1 max-w-md">
             <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
               <Search size={18} />
             </div>
             <input 
               type="text"
               value={searchQuery}
               onChange={e => setSearchQuery(e.target.value)}
               placeholder="Search entries..."
               className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-800 text-sm font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all placeholder:text-slate-400"
             />
           </div>

           {/* Mood Filter */}
           <div className="relative">
             <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Filter size={16} />
             </div>
             <select
                value={moodFilter}
                onChange={e => setMoodFilter(e.target.value)}
                className="pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl appearance-none outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 cursor-pointer"
             >
                {availableMoods.map(mood => (
                  <option key={mood} value={mood}>
                     {mood === 'all' ? 'All Moods' : `Mood: ${mood}`}
                  </option>
                ))}
             </select>
           </div>
        </div>
      </div>

      {/* Grid Content */}
      <div className="flex-1 overflow-y-auto p-10">
         {filteredEntries.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center opacity-70">
               <div className="text-slate-300 mb-4"><Search size={48} /></div>
               <h3 className="text-lg font-bold text-slate-600 mb-1">No matches found</h3>
               <p className="text-sm text-slate-500">Try adjusting your search or filters.</p>
            </div>
         ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredEntries.map(entry => (
                <JournalCard key={entry.id} entry={entry} />
              ))}
            </div>
         )}
      </div>
    </div>
  );
}
