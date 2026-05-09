import { Api } from "./ApiService";

export default {
    listar: () => {
        return Api().get('tipo-tarifas');
    },
    guardar: (tipoTarifa) => {
        return Api().post('tipo-tarifas', tipoTarifa);
    },
    mostrar: (id) => {
        return Api().get(`tipo-tarifas/${id}`);
    },
    actualizar: (id, tipoTarifa) => {
        return Api().put(`tipo-tarifas/${id}`, tipoTarifa);
    },
    eliminar: (id) => {
        return Api().delete(`tipo-tarifas/${id}`);
    }
}