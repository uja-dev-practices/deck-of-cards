import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUserHistory, deleteHistoryItem } from '../services/docService';
import Step3FinalGraph from '../components/editor/Step3FinalGraph';

export default function History() {
  const [historyItems, setHistoryItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const data = await getUserHistory();
      const items = Array.isArray(data) ? data : data.history || data.items || [];
      
      setHistoryItems(items.reverse()); 
    } catch (error) {
      console.error("Error fetching history:", error);
      alert("Hubo un problema al cargar el historial.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que quieres borrar este modelo definitivamente?')) return;
    
    try {
      await deleteHistoryItem(id);
      setHistoryItems(prev => prev.filter(item => item._id !== id && item.id !== id));
      if (expandedId === id) setExpandedId(null);
    } catch (error) {
      alert("Error al borrar: " + error);
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-8 animate-fade-in pb-12">      
      {/* Cabecera */}
      <div className="flex justify-between items-center bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-3xl font-black text-slate-800">Mi Historial</h1>
          <p className="text-slate-500 font-medium mt-1">
            Aquí están todas las gráficas y modelos que has guardado.
          </p>
        </div>
        <Link 
          to="/editor" 
          className="px-6 py-3 bg-blue-50 text-blue-600 font-bold rounded-xl hover:bg-blue-100 transition-colors shadow-sm"
        >
          + Nuevo Modelo
        </Link>
      </div>

      {/* Lista de Historial */}
      {isLoading ? (
        <div className="bg-white p-12 rounded-3xl shadow-sm border border-slate-200 flex flex-col items-center justify-center text-slate-400 border-dashed">
           <div className="animate-spin text-4xl mb-4">⏳</div>
           <p className="font-medium">Cargando tus gráficas...</p>
        </div>
      ) : historyItems.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl shadow-sm border border-slate-200 flex flex-col items-center justify-center text-slate-400 border-dashed">
           <span className="text-6xl mb-4">📭</span>
           <p className="font-medium text-lg">Aún no has guardado ningún modelo.</p>
           <p className="text-sm mt-2">Ve al editor, crea una gráfica y dale a "Guardar".</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {historyItems.map((item) => {
            const itemId = item._id || item.id;
            const isExpanded = expandedId === itemId;

            return (
              <div key={itemId} className={`bg-white rounded-2xl shadow-sm border transition-all duration-300 ${isExpanded ? 'border-blue-300 ring-4 ring-blue-50' : 'border-slate-200 hover:border-slate-300'}`}>
                
                {/* Cabecera de la Card */}
                <div className="p-6 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50 rounded-t-2xl">
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl shadow-inner">
                      📊
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-800">{item.name || 'Modelo sin título'}</h3>
                      <p className="text-sm text-slate-500 font-medium">
                        {item.created_at 
                          ? `Guardado el ${new Date(item.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}` 
                          : 'Guardado en el historial'
                        }
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 w-full sm:w-auto">
                    <button 
                      onClick={() => toggleExpand(itemId)} 
                      className={`flex-1 sm:flex-none px-6 py-2.5 font-bold rounded-xl transition-colors ${isExpanded ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
                    >
                      {isExpanded ? 'Ocultar Gráfica ▴' : 'Ver Gráfica ▾'}
                    </button>
                    <button 
                      onClick={() => handleDelete(itemId)} 
                      className="px-4 py-2.5 bg-white border border-red-200 text-red-500 font-bold rounded-xl hover:bg-red-50 transition-colors shadow-sm"
                      title="Borrar modelo"
                    >
                      Borrar
                    </button>
                  </div>
                </div>

                {/* Contenido Desplegable (La gráfica) */}
                {isExpanded && (
                  <div className="p-6 border-t border-slate-100 animate-fade-in bg-white rounded-b-2xl">
                    <Step3FinalGraph data={item} criterionName={item.name} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}