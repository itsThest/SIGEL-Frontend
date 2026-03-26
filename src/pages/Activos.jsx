import React, { useState, useMemo } from 'react';
import { Plus, X, AlertTriangle, ImageOff, Search, Package, ShoppingCart, Send, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSkeleton from '../components/LoadingSkeleton';
import useApi from '../hooks/useApi';
import usePagination from '../hooks/usePagination';
import Pagination from '../components/Pagination';
import { getActivos, crearActivo } from '../services/activosService';
import { crearPrestamo } from '../services/prestamosService';
import { isAdmin, getUser } from '../utils/auth';

const PAGE_SIZE = 10;

/* ── Constantes ──────────────────────────────────────────────── */
const CATEGORIAS = [
  'Laptop', 'PC de Escritorio', 'Switch', 'Router', 'Access Point',
  'Proyector', 'Osciloscopio', 'Multímetro', 'Fuente de Poder',
  'Analizador de Espectro', 'Cable / Patch', 'Otro',
];
const ESTADOS = ['Bueno', 'Regular', 'Dañado'];

/* ── Badges ──────────────────────────────────────────────────── */
const DisponibilidadBadge = ({ value }) => {
  const map = {
    'Disponible':       'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Prestado':         'bg-amber-50   text-amber-700   border-amber-200',
    'En Mantenimiento': 'bg-blue-50    text-blue-700    border-blue-200',
  };
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${map[value] ?? 'bg-gray-100 text-gray-500 border-gray-200'}`}>
      {value}
    </span>
  );
};

const EstadoBadge = ({ value }) => {
  const map = { 'Bueno': 'text-emerald-600', 'Regular': 'text-amber-600', 'Dañado': 'text-utn-red font-bold' };
  return <span className={`text-xs font-medium ${map[value] ?? 'text-gray-500'}`}>{value ?? '—'}</span>;
};

/* ── Modal: Registrar nuevo activo (solo Admin) ──────────────── */
const ModalNuevoActivo = ({ onClose, onSuccess }) => {
  const [form, setForm] = useState({
    codigo_institucional: '', nombre: '', mac_o_serial: '',
    tipo: 'Laptop', estado_fisico: 'Bueno', disponibilidad: 'Disponible',
  });
  const [foto,    setFoto]    = useState(null);
  const [preview, setPreview] = useState(null);
  const [saving,  setSaving]  = useState(false);
  const [err,     setErr]     = useState(null);

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const handleFoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFoto(file);
    setPreview(URL.createObjectURL(file));
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true); setErr(null);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (foto) fd.append('foto', foto);
      await crearActivo(fd);
      onSuccess();
    } catch (ex) {
      setErr(ex.response?.data?.error ?? 'Error al guardar el activo.');
    } finally { setSaving(false); }
  };

  const inputCls = "w-full px-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-carrera-blue/30 focus:border-carrera-blue text-sm transition-all placeholder-gray-400";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 bg-carrera-blue">
          <div>
            <h2 className="text-base font-bold text-white">Registrar nuevo equipo</h2>
            <p className="text-xs text-white/60 mt-0.5">Completa los datos del activo</p>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {err && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 px-3 py-2.5 rounded-xl text-sm">
              <AlertTriangle size={15} className="mt-0.5 flex-shrink-0" />{err}
            </div>
          )}
          {[
            { label: 'Código institucional', name: 'codigo_institucional', placeholder: 'UTN-LAB-001' },
            { label: 'Nombre del equipo',    name: 'nombre',               placeholder: 'Laptop HP ProBook 450 G8' },
            { label: 'Número de serie / MAC',name: 'mac_o_serial',         placeholder: 'SN-5CG1234567 o AA:BB:CC:DD:EE:FF' },
          ].map(f => (
            <div key={f.name}>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">{f.label} <span className="text-utn-red">*</span></label>
              <input required name={f.name} value={form[f.name]} onChange={handle} placeholder={f.placeholder} className={inputCls} />
            </div>
          ))}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Categoría <span className="text-utn-red">*</span></label>
              <select name="tipo" value={form.tipo} onChange={handle} className={inputCls}>
                {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Estado físico</label>
              <select name="estado_fisico" value={form.estado_fisico} onChange={handle} className={inputCls}>
                {ESTADOS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Foto <span className="text-gray-400 font-normal">(opcional)</span></label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center text-gray-300 flex-shrink-0 overflow-hidden">
                {preview ? <img src={preview} alt="preview" className="w-full h-full object-cover" /> : <Package size={22} />}
              </div>
              <input type="file" accept="image/*" onChange={handleFoto}
                className="flex-1 text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-carrera-blue/10 file:text-carrera-blue file:text-xs file:font-semibold hover:file:bg-carrera-blue/20 cursor-pointer" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">Cancelar</button>
            <button type="submit" disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-carrera-blue text-white text-sm font-semibold hover:bg-blue-900 transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:hover:scale-100 disabled:opacity-60 flex items-center gap-2 shadow-md">
              {saving
                ? <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Guardando…</>
                : <><Plus size={16}/> Guardar equipo</>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const CarritoPanel = ({ carrito, onRemove, onEnviar, sending, onClear }) => {
  if (carrito.length === 0) return null;
  return (
    <div className="fixed bottom-6 right-6 z-40 w-[calc(100vw-3rem)] sm:w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-carrera-blue">
        <div className="flex items-center gap-2 text-white">
          <ShoppingCart size={16} />
          <span className="text-sm font-bold">Mi Solicitud ({carrito.length})</span>
        </div>
        <button onClick={onClear} className="text-white/70 hover:text-white transition-colors">
          <X size={16} />
        </button>
      </div>
      <div className="max-h-48 overflow-y-auto divide-y divide-gray-50">
        {carrito.map(a => (
          <div key={a.id_activo} className="flex items-center gap-3 px-4 py-2.5">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-800 truncate">{a.nombre}</p>
              <p className="text-[10px] text-gray-400">{a.codigo_institucional}</p>
            </div>
            <button onClick={() => onRemove(a.id_activo)} className="text-gray-300 hover:text-utn-red transition-colors flex-shrink-0">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
      <div className="px-4 py-3 border-t border-gray-100">
        <button
          onClick={onEnviar}
          disabled={sending}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-carrera-blue text-white text-sm font-semibold hover:bg-blue-900 transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:hover:scale-100 disabled:opacity-60 shadow-md"
        >
          {sending
            ? <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Enviando…</>
            : <><Send size={14} /> Enviar Solicitud</>
          }
        </button>
      </div>
    </div>
  );
};

/* ── Página principal ─────────────────────────────────────────── */
const Activos = () => {
  const { data, loading, error, refetch } = useApi(getActivos);
  const [modal,   setModal]   = useState(false);
  const [query,   setQuery]   = useState('');
  const [categoriaActiva, setCategoriaActiva] = useState('Todos');
  const [carrito, setCarrito] = useState([]);   // equipos seleccionados para solicitud
  const [sending, setSending] = useState(false);

  const admin   = isAdmin();
  const user    = getUser();
  const activos = data?.data ?? [];

  const categoriasDinamicas = useMemo(() => {
    const ignorados = ['Instrumento', 'Equipo', 'instrumento', 'equipo'];
    return ['Todos', ...new Set(activos.map(a => a.tipo).filter(t => t && !ignorados.includes(t)))];
  }, [activos]);

  const filtrados = useMemo(() => {
    let result = activos;
    if (categoriaActiva !== 'Todos') {
      result = result.filter(a => a.tipo === categoriaActiva);
    }
    const q = query.toLowerCase().trim();
    if (q) {
      result = result.filter(a =>
        a.nombre?.toLowerCase().includes(q) ||
        a.codigo_institucional?.toLowerCase().includes(q) ||
        a.mac_o_serial?.toLowerCase().includes(q) ||
        a.tipo?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [activos, query, categoriaActiva]);

  const pag = usePagination(filtrados, PAGE_SIZE);
  const handleQuery = (v) => { setQuery(v); pag.reset(); };
  const handleCategoria = (cat) => { setCategoriaActiva(cat); pag.reset(); };

  /* Carrito */
  const enCarrito   = (id) => carrito.some(a => a.id_activo === id);
  const addCarrito  = (activo) => {
    if (!enCarrito(activo.id_activo)) {
      setCarrito(c => [...c, activo]);
      toast.success(`${activo.nombre} añadido a la solicitud`, { position: 'bottom-center' });
    }
  };
  const removeCarrito = (id)   => setCarrito(c => c.filter(a => a.id_activo !== id));

  const enviarSolicitud = async () => {
    if (!user?.id) { toast.error('No se pudo identificar al usuario. Vuelve a iniciar sesión.'); return; }
    setSending(true);
    try {
      await crearPrestamo({
        id_usuario: user.id,
        id_activos: carrito.map(a => a.id_activo),
      });
      setCarrito([]);
      refetch();
      toast.success(`Solicitud enviada (${carrito.length} equipo${carrito.length !== 1 ? 's' : ''}). Pendiente de aprobación.`);
    } catch (ex) {
      toast.error(ex.response?.data?.error ?? 'Error al enviar la solicitud.');
    } finally { setSending(false); }
  };

  return (
    <div className="animate-in fade-in duration-500">
      {/* Carrito flotante — solo para no-admins */}
      {!admin && (
        <CarritoPanel
          carrito={carrito}
          onRemove={removeCarrito}
          onEnviar={enviarSolicitud}
          sending={sending}
          onClear={() => setCarrito([])}
        />
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Activos</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Inventario de equipos del laboratorio
            {!loading && !error && <span className="ml-2 text-carrera-blue font-semibold">({activos.length} equipos)</span>}
          </p>
        </div>
        {/* Botón solo para Admin */}
        {admin && (
          <button onClick={() => setModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-carrera-blue text-white text-sm font-semibold rounded-xl hover:bg-blue-900 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 self-start sm:self-auto">
            <Plus size={16} /> Nuevo equipo
          </button>
        )}
      </div>

      {/* Barra de búsqueda */}
      <div className="relative mb-5">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="search" value={query} onChange={e => handleQuery(e.target.value)}
          placeholder="Buscar por nombre, código, serie o categoría…"
          className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-carrera-blue/30 focus:border-carrera-blue text-sm transition-all placeholder-gray-400 shadow-sm" />
        {query && (
          <button onClick={() => handleQuery('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X size={15} />
          </button>
        )}
      </div>

      {/* Filtros de Categoría */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {categoriasDinamicas.map(cat => (
          <button
            key={cat}
            onClick={() => handleCategoria(cat)}
            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 border ${
              categoriaActiva === cat
                ? 'bg-carrera-blue text-white border-carrera-blue shadow-md'
                : 'bg-white text-gray-500 border-gray-200 hover:bg-blue-50 hover:text-carrera-blue hover:border-blue-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {modal && <ModalNuevoActivo onClose={() => setModal(false)} onSuccess={() => { setModal(false); refetch(); toast.success('Equipo registrado impecablemente.'); }} />}
      {loading && <LoadingSkeleton count={3} type="table" />}

      {error && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />{error}
        </div>
      )}

      {!loading && !error && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {filtrados.length === 0 ? (
            <div className="py-16 flex flex-col items-center text-center">
              <Package size={48} className="text-gray-200 mb-4" />
              {query
                ? <><p className="text-gray-500 font-medium">Sin resultados</p><p className="text-gray-400 text-sm mt-1">No hay equipos para "<strong>{query}</strong>"</p></>
                : <><p className="text-gray-500 font-medium">Sin equipos registrados</p><p className="text-gray-400 text-sm mt-1">Haz clic en "Nuevo equipo" para agregar el primero</p></>
              }
            </div>
          ) : (
            <>
              {query && (
                <div className="px-5 py-2.5 border-b border-gray-100 bg-carrera-blue/5 text-xs text-carrera-blue font-medium mb-6">
                  {filtrados.length} resultado{filtrados.length !== 1 ? 's' : ''} para "{query}"
                </div>
              )}

              {/* Lógica de Agrupación sobre los items de la página actual */}
              {Object.entries(
                pag.paginated.reduce((acc, activo) => {
                  const cat = activo.tipo || 'Sin Categoría';
                  if (!acc[cat]) acc[cat] = [];
                  acc[cat].push(activo);
                  return acc;
                }, {})
              ).map(([categoria, listaActivos], index) => (
                <div key={categoria} className={`animate-in fade-in slide-in-from-bottom-4 duration-500 ${index > 0 ? "mt-10" : ""}`}>
                  <h3 className="text-lg font-bold text-gray-700 bg-gray-50/50 px-5 py-3 border-b border-gray-200">
                    {categoria}
                    <span className="ml-3 text-xs font-normal text-gray-400 bg-white px-2 py-0.5 rounded-md border border-gray-200 shadow-sm">
                      {listaActivos.length} equipo{listaActivos.length !== 1 ? 's' : ''}
                    </span>
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50/30 border-b border-gray-100">
                          {['Foto', 'Código', 'Nombre', 'Serie / MAC', 'Estado físico', 'Disponibilidad',
                            ...(!admin ? ['Solicitar'] : [])
                          ].map(h => (
                            <th key={h} className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {listaActivos.map(a => (
                          <tr key={a.id_activo} className="hover:bg-gray-50/60 transition-colors">
                            <td className="px-5 py-3">
                              {a.foto_url
                                ? <img src={a.foto_url} alt={a.nombre} className="w-10 h-10 rounded-lg object-cover border border-gray-200" />
                                : <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-300"><ImageOff size={16} /></div>
                              }
                            </td>
                            <td className="px-5 py-3 font-mono text-xs text-gray-500">{a.codigo_institucional}</td>
                            <td className="px-5 py-3 font-semibold text-gray-800 max-w-[180px] truncate">{a.nombre}</td>
                            <td className="px-5 py-3 font-mono text-xs text-gray-500">{a.mac_o_serial}</td>
                            <td className="px-5 py-3"><EstadoBadge value={a.estado_fisico} /></td>
                            <td className="px-5 py-3"><DisponibilidadBadge value={a.disponibilidad} /></td>
                            {!admin && (
                              <td className="px-5 py-3">
                              {a.disponibilidad === 'Disponible' ? (
                                  enCarrito(a.id_activo) ? (
                                    <button
                                      onClick={() => removeCarrito(a.id_activo)}
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-carrera-green/10 text-carrera-green text-xs font-semibold rounded-lg border border-carrera-green/30 hover:bg-red-50 hover:text-utn-red hover:border-red-200 transition-all duration-300 hover:scale-[1.03] active:scale-95"
                                    >
                                      <CheckCircle size={12} /> Añadido
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => addCarrito(a)}
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-carrera-blue text-white text-xs font-semibold rounded-lg hover:bg-blue-900 transition-all duration-300 hover:scale-[1.03] active:scale-95 shadow-sm"
                                    >
                                      <Plus size={12} /> Añadir a Solicitud
                                    </button>
                                  )
                                ) : (
                                  <span className="text-xs text-gray-400">No disponible</span>
                                )}
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}

              <Pagination
                page={pag.page}
                totalPages={pag.totalPages}
                total={filtrados.length}
                pageSize={PAGE_SIZE}
                goNext={pag.goNext}
                goPrev={pag.goPrev}
                goPage={pag.goPage}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Activos;
