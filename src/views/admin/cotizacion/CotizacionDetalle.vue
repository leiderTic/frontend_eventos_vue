<template>
    <div class="px-2 md:px-4 pb-10" v-if="!loading && cotizacion">
        <!-- HEADER VOLVER -->
        <div class="flex items-center justify-between mb-4 mt-2">
            <router-link :to="{ name: 'cotizacion' }">
                <Button label="Volver a la lista" icon="pi pi-arrow-left" text class="!text-surface-500 font-bold !p-0 hover:!bg-transparent hover:!text-primary" />
            </router-link>
            <!-- <div class="font-bold text-lg text-surface-700">Detalle</div> -->
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <!-- COLUMNA IZQUIERDA: Tarjeta Principal -->
            <div class="lg:col-span-9 space-y-6">
                <!-- TARJETA PRINCIPAL -->
                <div class="bg-white rounded-2xl border border-surface-200 shadow-sm p-6 lg:p-8 relative">
                    
                    <!-- ENCABEZADO -->
                    <div class="flex justify-between items-start mb-6">
                        <div>
                            <p class="text-surface-500 text-xs font-bold uppercase tracking-wider !m-0 !p-0 leading-none mb-1">COT-{{ new Date(cotizacion.created_at).getFullYear() }}-{{ String(cotizacion.id).padStart(3, '0') }}</p>
                            <h2 class="text-2xl lg:text-3xl font-black text-surface-900 !m-0 !p-0 leading-none">{{ getInstitucionNombre() }}</h2>
                            <p class="text-surface-500 text-sm !m-0 !p-0 leading-none mt-1">{{ getContactoNombre() }} - {{ getContactoTelefono() }}</p>
                        </div>
                        <div class="text-right flex flex-col items-end">
                            <span class="border border-blue-200 text-blue-600 bg-blue-50 px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                                {{ getEstadoLabel(cotizacion.paso) }}
                            </span>
                            <p class="text-xs text-surface-400 mt-2">Por {{ cotizacion.user?.name || 'Sistema' }}</p>
                        </div>
                    </div>

                    <!-- STEPPER HORIZONTAL -->
                    <div class="flex items-center gap-2 overflow-x-auto pb-4 hide-scrollbar mb-6">
                        <template v-for="(step, index) in stepsBase" :key="index">
                            <div class="flex items-center flex-shrink-0">
                                <div @click="step.id === cotizacion.paso ? drawerVisible = true : null" 
                                     :class="[
                                         'px-4 py-1.5 rounded text-xs border whitespace-nowrap text-center transition-all',
                                         step.id === cotizacion.paso
                                           ? 'bg-red-500 text-white border-red-500 font-bold cursor-pointer shadow-md hover:bg-red-600 hover:shadow-lg'
                                           : step.id < cotizacion.paso
                                             ? 'bg-green-50 text-green-700 border-green-300 font-medium cursor-default'
                                             : 'bg-surface-50 text-surface-400 border-surface-200 opacity-50 cursor-default'
                                     ]"
                                     :title="step.id === cotizacion.paso ? 'Ver detalles del paso actual' : step.label">
                                    <template v-if="step.id < cotizacion.paso">
                                        <i class="pi pi-check-circle text-green-600 mr-1 text-[10px]"></i>
                                    </template>
                                    {{ step.short || step.label }}
                                    <i v-if="step.id === cotizacion.paso" class="pi pi-caret-right text-[10px] ml-1"></i>
                                </div>
                            </div>
                            <div v-if="index < stepsBase.length - 1" class="w-4 border-t border-dashed border-surface-300 flex-shrink-0"></div>
                        </template>
                    </div>

                    <!-- DATOS DE LA COTIZACION -->
                    <div class="grid grid-cols-2 gap-y-4 gap-x-8 text-sm mb-8 border-b border-surface-200 pb-8">
                        <div>
                            <p class="text-xs font-bold text-surface-500 uppercase tracking-wider !m-0 !p-0 leading-none mb-1">Tipo de Evento</p>
                            <p class="font-bold text-surface-900 !m-0 !p-0 leading-tight">{{ cotizacion.evento?.descripcion || 'No definido' }}</p>
                        </div>
                        <div>
                            <p class="text-xs font-bold text-surface-500 uppercase tracking-wider !m-0 !p-0 leading-none mb-1">Fechas</p>
                            <p class="font-bold text-surface-900 !m-0 !p-0 leading-tight">{{ formatDateShort(cotizacion.fecha_ini) }} — {{ formatDateShort(cotizacion.fecha_fin) }} ({{ totalDias }} días)</p>
                        </div>
                        <div>
                            <p class="text-xs font-bold text-surface-500 uppercase tracking-wider !m-0 !p-0 leading-none mb-1">Espacios</p>
                            <p class="text-surface-800 !m-0 !p-0 leading-tight">{{ getEspaciosList() || '-' }}</p>
                        </div>
                        <div>
                            <p class="text-xs font-bold text-surface-500 uppercase tracking-wider !m-0 !p-0 leading-none mb-1">Descripción</p>
                            <p class="text-surface-800 !m-0 !p-0 leading-tight">{{ cotizacion.descripcion || '-' }}</p>
                        </div>
                    </div>

                    <!-- LISTA DE ITEMS (CARRO) -->
                    <div class="mb-6 space-y-1">
                        <template v-if="cotizacion.tarifas && cotizacion.tarifas.length > 0">
                            <div v-for="(tarifa, index) in cotizacion.tarifas" :key="'t-'+index" class="flex justify-between py-2 border-b border-surface-100 items-center">
                                <div>
                                    <p class="font-bold text-surface-900 text-sm !m-0 !p-0 leading-tight">{{ tarifa.espacio?.nombre || 'Espacio' }}</p>
                                    <p class="text-xs text-surface-500 !m-0 !p-0 leading-tight mt-0.5">{{ tarifa.pivot?.dias || 0 }}d × Bs {{ formatCurrency(tarifa.pivot?.precio_aplicado || 0) }} ({{ tarifa.evento?.descripcion || tarifa.tipo_tarifa?.nombre || 'Tarifa' }})</p>
                                </div>
                                <div class="font-black text-surface-900 text-base">
                                    Bs {{ formatCurrency(Number(tarifa.pivot?.dias || 0) * Number(tarifa.pivot?.precio_aplicado || 0)) }}
                                </div>
                            </div>
                        </template>

                        <template v-if="cotizacion.servicios && cotizacion.servicios.length > 0">
                            <div v-for="(servicio, index) in cotizacion.servicios" :key="'s-'+index" class="flex justify-between py-2 border-b border-surface-100 items-center">
                                <div>
                                    <p class="font-bold text-surface-900 text-sm !m-0 !p-0 leading-tight">{{ servicio.nombre }}</p>
                                    <p class="text-xs text-surface-500 !m-0 !p-0 leading-tight mt-0.5">
                                        {{ servicio.pivot?.cantidad || 1 }}u × Bs {{ formatCurrency(servicio.pivot?.precio_aplicado || 0) }} <span v-if="servicio.pivot?.dias">× {{ servicio.pivot.dias }} día(s)</span>
                                    </p>
                                </div>
                                <div class="font-black text-surface-900 text-base">
                                    Bs {{ formatCurrency(Number(servicio.pivot?.cantidad || 1) * Number(servicio.pivot?.precio_aplicado || 0) * Number(servicio.pivot?.dias || 1)) }}
                                </div>
                            </div>
                        </template>
                    </div>

                    <!-- BANNER TOTAL -->
                    <div class="bg-primary-900 text-primary-contrast py-4 px-6 flex justify-between items-center rounded-lg mt-8">
                        <span class="text-sm font-bold uppercase tracking-wider">TOTAL COTIZACIÓN</span>
                        <span class="text-xl font-black">Bs {{ formatCurrency(calcularTotal()) }}</span>
                    </div>

                    <!-- BOTONERAS DE ACCIÓN -->
                    <div class="mt-6 flex flex-col gap-3">
                        <Button label="Reimprimir" icon="pi pi-print" severity="secondary" outlined class="w-full font-bold shadow-sm" />
                        <Button label="Gestionar Cotización" icon="pi pi-pencil" severity="warning" class="w-full font-bold shadow-sm" />
                        <Button :label="'Confirmar Reserva / Registrar Anticipo'" icon="pi pi-check-square" severity="success" class="w-full font-bold shadow-sm" />
                    </div>
                </div>

                <!-- HISTORIAL CRM -->
                <div class="bg-white rounded-2xl border border-surface-200 shadow-sm relative pt-0">
                    <!-- CRM HEADER -->
                    <div class="flex items-center justify-between p-6 border-b border-surface-100">
                        <div class="flex items-center gap-3">
                            <span class="bg-yellow-100 text-yellow-600 rounded-lg p-2 text-sm leading-none">🤝</span>
                            <h3 class="text-lg font-black text-surface-900 m-0">Historial CRM</h3>
                            <span class="text-xs bg-surface-100 text-surface-600 px-3 py-1 rounded-full font-bold ml-2">0 gestiones</span>
                        </div>
                        <Button label="+ Nueva gestión" size="small" severity="primary" class="rounded-full px-4" />
                    </div>

                    <!-- FORMULARIO NUEVA GESTION -->
                    <div class="p-6">
                        <div class="bg-surface-50 border border-surface-200 p-6 rounded-xl text-left">
                            <h4 class="text-sm font-bold text-primary mb-4 m-0">+ Registrar nueva gestión</h4>
                            
                            <div class="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label class="block text-xs font-bold text-surface-600 mb-2 uppercase">TIPO</label>
                                    <Dropdown :options="['Llamada', 'Reunión', 'Correo', 'WhatsApp']" placeholder="Llamada" class="w-full" />
                                </div>
                                <div>
                                    <label class="block text-xs font-bold text-surface-600 mb-2 uppercase">FECHA</label>
                                    <Calendar placeholder="06/05/2026" class="w-full" />
                                </div>
                            </div>
                            
                            <div class="mb-4">
                                <label class="block text-xs font-bold text-surface-600 mb-2 uppercase">DESCRIPCIÓN</label>
                                <Textarea rows="3" class="w-full border-surface-300" />
                            </div>
                            
                            <div class="mb-5">
                                <label class="block text-xs font-bold text-surface-600 mb-2 uppercase">RESULTADO / SIGUIENTE PASO</label>
                                <InputText class="w-full" />
                            </div>
                            
                            <Button label="Guardar gestión" severity="primary" class="rounded-full px-6" />
                        </div>
                        
                        <p class="text-surface-400 text-sm text-center mt-8 mb-4">Sin gestiones registradas aún.</p>
                    </div>
                </div>

            </div>

            <!-- COLUMNA DERECHA: Flujo de Aprobación -->
            <div class="lg:col-span-3">
                <div class="bg-white rounded-2xl shadow-sm border border-surface-200 p-5 sticky top-24">
                    <h3 class="text-lg font-black text-surface-800 mb-4 flex items-center gap-2 m-0 tracking-tight leading-none uppercase">
                        <i class="pi pi-sort-alt text-surface-600"></i> FLUJO DE APROBACIÓN
                    </h3>
                    
                    <div class="space-y-2">
                        <div v-for="step in approvalSteps" :key="step.id" 
                             :class="[
                                 'rounded-xl border p-4 flex gap-4 items-center relative transition-all',
                                 step.status === 'completed' ? 'bg-white border-surface-200' : (step.status === 'current' ? 'bg-surface-0 border-yellow-500 shadow-sm' : 'bg-white border-surface-100 opacity-50')
                             ]">
                            
                            <!-- Icono Izquierdo Base -->
                            <div class="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center border"
                                 :class="[
                                     step.status === 'current' ? 'bg-white text-blue-600 border-surface-200 shadow-sm' : (step.status === 'completed' ? 'bg-surface-50 text-surface-400 border-surface-200' : 'bg-surface-50 text-surface-300 border-surface-100')
                                 ]">
                                <i :class="[step.status === 'completed' ? 'pi pi-check text-green-600 font-bold' : step.icon, 'text-sm']"></i>
                            </div>

                            <!-- Contenido Central -->
                            <div class="flex-grow min-w-0" style="line-height: 1">
                                <div class="flex items-center gap-2 !m-0 !p-0">
                                    <p class="font-bold text-surface-900 text-sm !m-0 !p-0 truncate leading-tight">{{ step.label }}</p>
                                    <span class="text-[10px] text-surface-400 hover:text-primary cursor-pointer whitespace-nowrap">▶ Ver</span>
                                </div>

                                <p v-if="step.status === 'current' && step.id > 1" class="text-xs text-surface-500 !m-0 !p-0 leading-none mt-0.5">Pendiente</p>
                                <p v-if="step.id === 1" class="text-[11px] text-surface-700 font-bold !m-0 !p-0 truncate leading-none mt-0.5">{{ cotizacion.user?.name || 'Sistema' }}</p>

                                <p class="text-[11px] text-surface-500 !m-0 !p-0 truncate leading-none mt-0.5">{{ step.desc }}</p>
                            </div>

                            <!-- Icono Derecho -->
                            <div class="flex-shrink-0 flex justify-center items-center w-6">
                                <i v-if="step.status === 'current'" class="pi pi-hourglass text-yellow-500 text-sm animate-pulse"></i>
                                <div v-else-if="step.status === 'pending'" class="w-3 h-3 rounded-full border-2 border-surface-300"></div>
                                <div v-else-if="step.status === 'completed'" class="w-3 h-3 rounded-full border-2 border-surface-200"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Sidebar Drawer Detalles -->
        <Drawer v-model:visible="drawerVisible" position="right" style="width: 20vw" class="p-0 border-l border-surface-200" :pt="{ header: { class: 'bg-primary text-primary-contrast' }, closeButton: { class: 'text-primary-contrast hover:text-white', style: 'right: 1.5rem; position: absolute;' } }">
            <template #header>
                <div class="flex items-center gap-3">
                    <i class="pi pi-user text-primary-100 text-xl bg-primary-700 p-2.5 rounded-full"></i>
                    <div>
                        <h2 class="text-base font-bold m-0 leading-tight text-white">Cotización Comercial</h2>
                        <span class="text-xs opacity-90 truncate text-primary-100">{{ getInstitucionNombre() }} • COT-{{ String(cotizacion.id).padStart(3, '0') }}</span>
                    </div>
                </div>
            </template>

            <div class="p-6 text-sm">
                <h4 class="font-bold text-surface-500 text-xs mt-2 mb-4 uppercase tracking-wider">DATOS DE LA COTIZACIÓN</h4>
                <div class="grid grid-cols-12 border-b border-surface-200 py-3 items-center">
                    <span class="col-span-4 text-surface-500">ID Cotización</span>
                    <span class="col-span-8 font-bold text-right text-surface-900 border-b border-white">COT-{{ new Date(cotizacion.created_at).getFullYear() }}-{{ String(cotizacion.id).padStart(3, '0') }}</span>
                </div>
                <div class="grid grid-cols-12 border-b border-surface-200 py-3 items-center">
                    <span class="col-span-4 text-surface-500">Cliente</span>
                    <span class="col-span-8 font-bold text-right text-surface-900">{{ getInstitucionNombre() }}</span>
                </div>
                <div class="grid grid-cols-12 border-b border-surface-200 py-3 items-center">
                    <span class="col-span-4 text-surface-500">NIT</span>
                    <span class="col-span-8 font-bold text-right text-surface-900">{{ getInstitucionNit() }}</span>
                </div>
                <div class="grid grid-cols-12 border-b border-surface-200 py-3 items-center">
                    <span class="col-span-4 text-surface-500">Contacto</span>
                    <span class="col-span-8 font-bold text-right text-surface-900">{{ getContactoNombre() }} - {{ getContactoTelefono() }}</span>
                </div>
                <div class="grid grid-cols-12 border-b border-surface-200 py-3 items-center">
                    <span class="col-span-4 text-surface-500">Correo</span>
                    <span class="col-span-8 font-bold text-right text-surface-900">{{ getContactoEmail() }}</span>
                </div>
                <div class="grid grid-cols-12 border-b border-surface-200 py-3 items-center">
                    <span class="col-span-4 text-surface-500">Tipo de Evento</span>
                    <span class="col-span-8 font-bold text-right text-surface-900">{{ cotizacion.evento?.descripcion }}</span>
                </div>
                <div class="grid grid-cols-12 border-b border-surface-200 py-3 items-center">
                    <span class="col-span-4 text-surface-500">Fecha Inicio</span>
                    <span class="col-span-8 font-bold text-right text-surface-900">{{ formatDateShort(cotizacion.fecha_ini) }}</span>
                </div>
                <div class="grid grid-cols-12 border-b border-surface-200 py-3 items-center">
                    <span class="col-span-4 text-surface-500">Fecha Fin</span>
                    <span class="col-span-8 font-bold text-right text-surface-900">{{ formatDateShort(cotizacion.fecha_fin) }}</span>
                </div>
                <div class="grid grid-cols-12 border-b border-surface-200 py-3 items-start">
                    <span class="col-span-4 text-surface-500 pt-0.5">Descripción</span>
                    <span class="col-span-8 font-bold text-right text-surface-900">{{ cotizacion.descripcion || '-' }}</span>
                </div>

                <h4 class="font-bold text-surface-500 text-xs mt-8 mb-4 uppercase tracking-wider">ESPACIOS COTIZADOS</h4>
                <div v-for="t in cotizacion.tarifas" :key="t.id" class="grid grid-cols-12 border-b border-surface-200 py-3 items-center">
                    <span class="col-span-8 font-bold text-surface-900 truncate">{{ t.espacio?.nombre }}</span>
                    <span class="col-span-4 text-surface-400 text-right uppercase text-[10px] truncate">{{ t.evento?.descripcion || t.tipo_tarifa?.nombre || 'Tarifa' }}</span>
                </div>

                <h4 class="font-bold text-surface-500 text-xs mt-8 mb-4 uppercase tracking-wider">EJECUTIVO ASIGNADO</h4>
                <div class="grid grid-cols-12 border-b border-surface-200 py-3 items-center">
                    <span class="col-span-4 text-surface-500">Nombre</span>
                    <span class="col-span-8 font-bold text-right text-surface-900">{{ cotizacion.user?.name || 'Sistema' }}</span>
                </div>
                <div class="grid grid-cols-12 border-b border-surface-200 py-3 items-center">
                    <span class="col-span-4 text-surface-500">Cargo</span>
                    <span class="col-span-8 font-bold text-right text-surface-900 truncate">Responsable Planificación y Org. Adm...</span>
                </div>
                <div class="grid grid-cols-12 border-b border-surface-200 py-3 items-center">
                    <span class="col-span-4 text-surface-500">Monto Cotizado</span>
                    <span class="col-span-8 font-bold text-right text-surface-900">Bs {{ formatCurrency(calcularTotal()) }}</span>
                </div>
            </div>
        </Drawer>
    </div>

    <!-- Loader -->
    <div v-else class="flex flex-col items-center justify-center py-20 h-[60vh]">
        <i class="pi pi-spinner pi-spin text-primary text-4xl mb-4"></i>
        <p class="text-surface-500 text-sm font-medium">Cargando...</p>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import cotizacionServices from '@/services/cotizacion.services';
import { useToast } from 'primevue/usetoast';

const route = useRoute();
const toast = useToast();
const loading = ref(true);
const cotizacion = ref(null);
const drawerVisible = ref(false);

onMounted(async () => {
    try {
        const id = route.params.id;
        const res = await cotizacionServices.mostrar(id);
        cotizacion.value = res.data;
    } catch (e) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar la cotización.', life: 5000 });
    } finally {
        loading.value = false;
    }
});

// PASOS
const stepsBase = [
    { id: 1, label: 'En gestión', short: 'En gestión', desc: 'Cotización y CRM', icon: 'pi pi-user' },
    { id: 2, label: 'Confirmación de Reserva', short: "Confirmación\nde Reserva", desc: 'Anticipo + documentos (Art.40)', icon: 'pi pi-file' },
    { id: 3, label: 'Reunión Operativa', short: "Reunión\nOperativa", desc: 'Agendar reunión operativa', icon: 'pi pi-calendar' },
    { id: 4, label: 'Pago Total + Garantía', short: "Pago Total +\nGarantía", desc: 'Garantía 20%', icon: 'pi pi-credit-card' },
    { id: 5, label: 'Informe de Inicio', short: "Informe de\nInicio", desc: 'Ejecutivo -> Jefe UCFCHM', icon: 'pi pi-file' },
    { id: 6, label: 'En Revisión Legal', short: "En Revisión\nLegal", desc: 'Extendido a área legal', icon: 'pi pi-briefcase' },
    { id: 7, label: 'Contrato Suscrito', short: "Contrato\nSuscrito", desc: 'Elaboración y firma (Art.44)', icon: 'pi pi-pencil' },
    { id: 8, label: 'Inicio Premontaje', short: "Inicio\nPremontaje", desc: 'Autorización de montaje', icon: 'pi pi-wrench' },
    { id: 9, label: 'Acta de Entrega', short: "Acta de\nEntrega", desc: 'Firma + anexo', icon: 'pi pi-home' },
    { id: 10, label: 'En Curso', short: "En Curso", desc: 'Evento activo', icon: 'pi pi-play' },
    { id: 11, label: 'Acta de Devolución', short: "Acta de\nDevolución", desc: 'Devolución conforme', icon: 'pi pi-replay' },
    { id: 12, label: 'Informe de Cierre', short: "Informe de\nCierre", desc: 'Evaluación final', icon: 'pi pi-flag' },
    { id: 13, label: 'Análisis de Garantía', short: "Análisis de\nGarantía", desc: 'Análisis', icon: 'pi pi-chart-pie' },
    { id: 14, label: 'Cerrado', short: "Cerrado", desc: 'Fin', icon: 'pi pi-check-circle' },
];

const approvalSteps = computed(() => {
    if (!cotizacion.value) return [];
    const pasoActual = cotizacion.value.paso || 1;
    return stepsBase.map(s => ({
        ...s,
        status: s.id < pasoActual ? 'completed' : (s.id === pasoActual ? 'current' : 'pending')
    }));
});

// Helpers
const formatDateShort = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' }).replace(/\//g, '-');
};

const totalDias = computed(() => {
    if (!cotizacion.value) return 1;
    const start = new Date(cotizacion.value.fecha_ini);
    const end = new Date(cotizacion.value.fecha_fin);
    return Math.max(1, Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24)) + 1);
});

const getInstitucionNombre = () => {
    if (!cotizacion.value?.clientes) return 'S/N';
    const inst = cotizacion.value.clientes.find(c => c.tipo_cliente_id === 1);
    const perso = cotizacion.value.clientes.find(c => c.tipo_cliente_id === 2);
    return inst ? inst.nombre : (perso ? perso.nombre : 'S/N');
};

const getInstitucionNit = () => {
    if (!cotizacion.value?.clientes) return '00000';
    const inst = cotizacion.value.clientes.find(c => c.tipo_cliente_id === 1);
    const perso = cotizacion.value.clientes.find(c => c.tipo_cliente_id === 2);
    return inst ? (inst.ci_nit || '-') : (perso ? (perso.ci_nit || '-') : '-');
};

const getContactoNombre = () => {
    if (!cotizacion.value?.clientes) return '-';
    const inst = cotizacion.value.clientes.find(c => c.tipo_cliente_id === 1);
    const perso = cotizacion.value.clientes.find(c => c.tipo_cliente_id === 2);
    if (inst && perso) return perso.nombre;
    if (!inst && perso) return perso.nombre;
    return '-';
};

const getContactoTelefono = () => {
    if (!cotizacion.value?.clientes) return '';
    const perso = cotizacion.value.clientes.find(c => c.tipo_cliente_id === 2);
    return perso ? perso.telefono || '' : '';
};

const getContactoEmail = () => {
    if (!cotizacion.value?.clientes) return '-';
    const perso = cotizacion.value.clientes.find(c => c.tipo_cliente_id === 2);
    const inst = cotizacion.value.clientes.find(c => c.tipo_cliente_id === 1);
    return perso?.email || inst?.email || '-';
};

const getEspaciosList = () => {
    if (!cotizacion.value || !cotizacion.value.tarifas) return '';
    const spaces = [...new Set(cotizacion.value.tarifas.map(t => `${t.espacio?.nombre} (${t.evento?.descripcion || t.tipo_tarifa?.nombre || 'Tarifa'})`))];
    return spaces.join(', ');
};

const calcularTotal = () => {
    if (!cotizacion.value) return 0;
    let t = 0;
    if (cotizacion.value.tarifas) {
        cotizacion.value.tarifas.forEach(ta => t += Number(ta.pivot?.dias || 0) * Number(ta.pivot?.precio_aplicado || 0));
    }
    if (cotizacion.value.servicios) {
        cotizacion.value.servicios.forEach(s => t += Number(s.pivot?.cantidad || 0) * Number(s.pivot?.dias || 1) * Number(s.pivot?.precio_aplicado || 0));
    }
    return t;
};

const formatCurrency = (val) => Number(val).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const getEstadoLabel = (paso) => {
    const found = stepsBase.find(s => s.id === paso);
    return found ? found.label : 'En gestión';
};
</script>

<style scoped>
.hide-scrollbar::-webkit-scrollbar {
    display: none;
}
.hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
</style>
