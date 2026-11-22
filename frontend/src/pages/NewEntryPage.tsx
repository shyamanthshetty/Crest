import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useJournalStore } from '../store/journalStore';

export default function NewEntryPage() {
    const { id } = useParams<{ id: string }>();
    const { 
        entries, updateEntry, syncEntry,
        addTransaction, removeTransaction, 
        customCategories, addCustomCategory,
        fetchEntries
    } = useJournalStore();
    
    const activeEntry = id ? entries[id] : null;

    useEffect(() => {
        if (!activeEntry && id) {
             fetchEntries();
        }
    }, [activeEntry, id, fetchEntries]);
    
    const [isSaving, setIsSaving] = useState(false);
    const syncTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Debounced sync to backend
    const debouncedSync = useCallback((entryId: string) => {
        if (syncTimeout.current) clearTimeout(syncTimeout.current);
        setIsSaving(true);
        syncTimeout.current = setTimeout(async () => {
            await syncEntry(entryId);
            setIsSaving(false);
        }, 1500);
    }, [syncEntry]);

    // Cleanup timeout on unmount, and do a final sync
    useEffect(() => {
        return () => {
            if (syncTimeout.current) clearTimeout(syncTimeout.current);
            if (id && entries[id]) {
                syncEntry(id);
            }
        };
    }, [id]);

    const handleUpdate = (updates: Partial<NonNullable<typeof activeEntry>>) => {
        if (!id) return;
        updateEntry(id, updates);
        debouncedSync(id);
    };

    // Financial Widget State
    const [amount, setAmount] = useState('');
    const [finType, setFinType] = useState<'expense'|'income'>('expense');
    const [category, setCategory] = useState('');
    const [note, setNote] = useState('');
    const [showNewCatInput, setShowNewCatInput] = useState(false);
    
    useEffect(() => {
        if (!category && customCategories.length > 0) {
            setCategory(customCategories[0]);
        }
    }, [customCategories, category]);

    if (!activeEntry) return null;

    const handleAddTransaction = () => {
        if (!amount || isNaN(Number(amount))) return;
        
        let finalCategory = category;
        if (showNewCatInput && category.trim()) {
             addCustomCategory(category.trim());
             finalCategory = category.trim();
        }
        
        if (!finalCategory) return;
        
        addTransaction(id!, {
            amount: Number(amount),
            type: finType,
            category: finalCategory,
            note: note.trim() || undefined,
        });
        
        setAmount('');
        setNote('');
        setShowNewCatInput(false);
        // Reset category drop to first valid custom Cat
        setCategory(customCategories[0] || '');
        debouncedSync(id!);
    };
    
    const totalCalc = activeEntry.transactions.reduce((acc, t) => {
        return acc + (t.type === 'income' ? t.amount : -t.amount);
    }, 0);

    return (
        <div className="flex flex-1 h-full overflow-hidden bg-[#F8FAFC]">
            {/* Editor Area (Middle Column) */}
            <div className="flex-[3] flex flex-col h-[calc(100%-1rem)] bg-white ml-2 my-2 rounded-[28px] shadow-sm border border-slate-200/60 overflow-hidden relative">
                {/* Header */}
                <header className="h-[76px] shrink-0 border-b border-slate-100 flex justify-between items-center px-8 z-10 bg-white">
                    <div className="flex items-center gap-3">
                        <span className="text-slate-400 text-[13px] font-medium">
                            {new Date(activeEntry.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span className="text-slate-300">/</span>
                        <span className="text-slate-900 text-[13px] font-bold">Draft</span>
                    </div>
                    
                    <div className="flex items-center gap-4">
                       <span className={`text-[12px] font-bold flex items-center gap-2 transition-all duration-300 ${isSaving ? 'text-indigo-400' : 'text-slate-300'}`}>
                           <span className="material-symbols-outlined text-[16px]">{isSaving ? 'cloud_sync' : 'cloud_done'}</span>
                           {isSaving ? 'Saving...' : 'Saved to Cloud'}
                       </span>
                    </div>
                </header>

                {/* Writing Canvas */}
                <div className="flex-1 overflow-y-auto px-16 py-14 flex flex-col relative group">
                    <input 
                        type="text" 
                        value={activeEntry.title || ''}
                        onChange={(e) => handleUpdate({ title: e.target.value })}
                        placeholder="The Title of Your Entry"
                        className="text-[44px] font-extrabold text-slate-800 placeholder:text-slate-200 outline-none w-full bg-transparent leading-tight tracking-[0.01em] mb-6"
                    />
                    
                    <textarea 
                        value={activeEntry.content || ''}
                        onChange={(e: any) => {
                            e.target.style.height = 'auto';
                            e.target.style.height = e.target.scrollHeight + 'px';
                            handleUpdate({ content: e.target.value });
                        }}
                        placeholder="Start writing your thoughts here... Let the words flow naturally in this quiet digital space."
                        className="flex-1 text-[17px] text-slate-500 placeholder:text-slate-300 outline-none w-full bg-transparent resize-none leading-[1.8] min-h-[300px] pb-20"
                    />

                    {/* Mic Icon Toolbar Drop */}
                    <div className="fixed bottom-12 right-[420px] opacity-30 group-hover:opacity-100 transition-opacity z-20">
                         <button className="w-12 h-12 rounded-full bg-indigo-50 hover:bg-indigo-100 ring-4 ring-white text-indigo-600 flex items-center justify-center transition-all shadow-md">
                             <span className="material-symbols-outlined text-[24px]">mic</span>
                         </button>
                    </div>
                </div>
            </div>

            {/* Metadata Sidebar (Right Column) */}
            <div className="flex-[1.8] min-w-[320px] max-w-[420px] h-full overflow-y-auto shrink-0 flex flex-col px-10 py-10 pb-20 no-scrollbar gap-[42px] border-l border-transparent">
               
               {/* Current Mood */}
               <div>
                  <h3 className="text-[11px] uppercase tracking-[0.15em] font-bold text-slate-400 mb-4">Current Mood</h3>
                  <div className="flex gap-2">
                     {['😄', '😌', '🤔', '😴', '😤'].map(emoji => (
                         <button 
                            key={emoji}
                            onClick={() => handleUpdate({ mood: activeEntry.mood === emoji ? null : emoji })}
                            className={`w-[46px] h-[46px] rounded-[14px] flex items-center justify-center text-[22px] transition-all duration-200 ${
                                activeEntry.mood === emoji 
                                    ? 'bg-amber-50 shadow-inner scale-95 ring-1 ring-amber-100' 
                                    : 'bg-white hover:bg-slate-50 shadow-sm border border-slate-100 hover:scale-[1.03]'
                            }`}
                         >
                            {emoji}
                         </button>
                     ))}
                  </div>
               </div>

               {/* Financial Dashboard */}
               <div>
                  <div className="flex items-center justify-between mb-4">
                      <h3 className="text-[11px] uppercase tracking-[0.15em] font-bold text-slate-400">Finance Tracker</h3>
                      <span className={`text-[13px] font-bold ${totalCalc >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {totalCalc >= 0 ? '+' : ''}${totalCalc.toFixed(2)}
                      </span>
                  </div>
                  
                  {/* Add Transaction Form */}
                  <div className="bg-white rounded-[20px] p-5 border border-slate-100 shadow-sm mb-5">
                      <div className="flex gap-2 mb-4">
                         <button 
                             onClick={() => setFinType('expense')}
                             className={`flex-1 py-1.5 text-[12px] font-bold rounded-lg transition-colors ${finType === 'expense' ? 'bg-rose-50 text-rose-600 ring-1 ring-rose-200/50' : 'text-slate-400 hover:bg-slate-50'}`}
                         >Expense</button>
                         <button 
                             onClick={() => setFinType('income')}
                             className={`flex-1 py-1.5 text-[12px] font-bold rounded-lg transition-colors ${finType === 'income' ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200/50' : 'text-slate-400 hover:bg-slate-50'}`}
                         >Income</button>
                      </div>
                      
                      <div className="flex items-center gap-3 mb-4 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5">
                          <span className="text-slate-400 font-bold">$</span>
                          <input 
                              type="number" 
                              value={amount}
                              onChange={e => setAmount(e.target.value)}
                              placeholder="0.00"
                              className="w-full text-[18px] font-bold text-slate-800 bg-transparent outline-none placeholder:text-slate-300"
                          />
                      </div>
                      
                      <div className="flex flex-col gap-3">
                          {!showNewCatInput ? (
                              <select 
                                  value={category}
                                  onChange={e => {
                                      if (e.target.value === '__add_new__') {
                                          setShowNewCatInput(true);
                                          setCategory('');
                                      } else {
                                          setCategory(e.target.value);
                                      }
                                  }}
                                  className="w-full bg-slate-50 border border-slate-100 text-slate-600 text-[13px] font-semibold rounded-xl px-4 py-3 outline-none appearance-none cursor-pointer"
                              >
                                  {customCategories.map(c => <option key={c} value={c}>{c}</option>)}
                                  <option value="__add_new__" className="font-bold text-indigo-600">+ Add custom category...</option>
                              </select>
                          ) : (
                              <div className="flex gap-2">
                                  <input 
                                      type="text"
                                      autoFocus
                                      value={category}
                                      onChange={e => setCategory(e.target.value)}
                                      placeholder="New category..."
                                      className="flex-1 bg-white border border-indigo-200 text-slate-800 text-[13px] font-semibold rounded-xl px-4 py-3 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all shadow-sm"
                                  />
                                  <button onClick={() => { setShowNewCatInput(false); setCategory(customCategories[0] || ''); }} className="w-11 flex items-center justify-center bg-slate-50 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100">
                                      <span className="material-symbols-outlined text-[18px]">close</span>
                                  </button>
                              </div>
                          )}
                          
                          <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2.5 focus-within:border-indigo-200 focus-within:bg-white transition-all">
                              <span className="material-symbols-outlined text-[18px] text-slate-400">edit_note</span>
                              <input 
                                  type="text" 
                                  value={note}
                                  onChange={e => setNote(e.target.value)}
                                  placeholder="Note (optional)..."
                                  className="w-full text-[13px] font-medium text-slate-800 bg-transparent outline-none placeholder:text-slate-400"
                              />
                          </div>

                          <button 
                             onClick={handleAddTransaction}
                             disabled={!amount || !category}
                             className="w-full bg-[#0F172A] hover:bg-[#1E293B] mt-1 disabled:opacity-50 disabled:cursor-not-allowed text-white text-[13px] font-bold py-3 rounded-xl transition-all shadow-[0_4px_12px_rgba(15,23,42,0.15)] active:translate-y-0.5"
                          >
                              Add Transfer
                          </button>
                      </div>
                  </div>

                  {/* Ledger List */}
                  <div className="flex flex-col gap-2">
                      {activeEntry.transactions.length === 0 ? (
                          <div className="text-center py-6 text-[12px] font-medium text-slate-400 italic">No transactions added</div>
                      ) : (
                          activeEntry.transactions.map(t => (
                              <div key={t.id} className="flex items-center justify-between p-3.5 rounded-[16px] bg-white border border-slate-100 shadow-sm group hover:border-slate-200 transition-colors">
                                  <div className="flex items-center gap-3.5 min-w-0">
                                      <div className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center shadow-sm ${t.type === 'income' ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
                                          <span className="material-symbols-outlined text-[18px]">{t.type === 'income' ? 'arrow_downward' : 'arrow_upward'}</span>
                                      </div>
                                      <div className="flex flex-col min-w-0">
                                          <span className="text-[13px] font-bold text-slate-700 truncate">{t.category}</span>
                                          {t.note && (
                                              <span className="text-[11px] font-medium text-slate-400 truncate" title={t.note}>
                                                  {t.note}
                                              </span>
                                          )}
                                      </div>
                                  </div>
                                  <div className="flex items-center gap-2 shrink-0">
                                      <span className={`text-[14px] font-bold ${t.type === 'income' ? 'text-emerald-600' : 'text-slate-800'}`}>
                                          ${t.amount.toFixed(2)}
                                      </span>
                                      <button onClick={() => { removeTransaction(activeEntry.id, t.id); debouncedSync(activeEntry.id); }} className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                                          <span className="material-symbols-outlined text-[16px]">delete</span>
                                      </button>
                                  </div>
                              </div>
                          ))
                      )}
                  </div>
               </div>

            </div>
        </div>
    );
}
