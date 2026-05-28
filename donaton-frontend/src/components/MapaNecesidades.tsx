import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Table, Container, Alert } from 'react-bootstrap';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { obtenerNecesidades } from '../services/bffService';
import type { Necesidad } from '../services/bffService';

import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const defaultIcon = new L.Icon.Default();

const MapaNecesidades: React.FC = () => {
  const [necesidades, setNecesidades] = useState<Necesidad[]>([]);
  const [mostrarAlternativaTabular, setMostrarAlternativaTabular] = useState<boolean>(false);
  const [cargando, setCargando] = useState<boolean>(true);
  const [errorGral, setErrorGral] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await obtenerNecesidades();
        setNecesidades(data);
      } catch (err) {
        console.error("Error cargando necesidades:", err);
        setMostrarAlternativaTabular(true);
        setErrorGral("Error al obtener las necesidades del servidor.");
      }
    };

    fetchData();

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {
          setCargando(false);
        },
        () => {
          setMostrarAlternativaTabular(true);
          setCargando(false);
        }
      );
    } else {
      setMostrarAlternativaTabular(true);
      setCargando(false);
    }
  }, []);

  if (cargando) {
    return <Container className="mt-4"><p>Cargando mapa de necesidades...</p></Container>;
  }

  if (mostrarAlternativaTabular) {
    return (
      <Container className="mt-4">
        <h2 className="mb-4">Lista de Necesidades (Vista Tabular)</h2>
        {errorGral && <Alert variant="warning">{errorGral}</Alert>}
        <Alert variant="info">
          La vista de mapa ha sido deshabilitada debido a permisos de ubicación o un error de red.
        </Alert>
        <Table striped bordered hover responsive>
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Recursos Solicitados</th>
              <th>Ubicación (Lat/Lon)</th>
              <th>Fecha de Reporte</th>
              <th>Tipo Emergencia</th>
            </tr>
          </thead>
          <tbody>
            {necesidades.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center">No hay necesidades registradas.</td>
              </tr>
            ) : (
              necesidades.map(n => (
                <tr key={n.id}>
                  <td>{n.id}</td>
                  <td>{n.recursos}</td>
                  <td>{n.latitud}, {n.longitud}</td>
                  <td>{new Date(n.fechaReporte).toLocaleString()}</td>
                  <td>{n.tipoEmergencia || 'General'}</td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <h2 className="mb-4">Mapa de Necesidades</h2>
      <div style={{ height: '600px', width: '100%' }}>
        <MapContainer center={[-33.4489, -70.6693]} zoom={10} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {necesidades.map(n => {
            const esGrave = n.tipoEmergencia?.toLowerCase().includes('incendio') || 
                            n.tipoEmergencia?.toLowerCase().includes('inundacion') || 
                            n.tipoEmergencia?.toLowerCase().includes('terremoto');
            const iconToUse = esGrave ? redIcon : defaultIcon;

            return (
              <Marker key={n.id} position={[n.latitud, n.longitud]} icon={iconToUse}>
                <Popup>
                  <strong>Recursos Solicitados:</strong> <br />
                  {n.recursos} <br />
                  <br />
                  <strong>Fecha:</strong> <br />
                  {new Date(n.fechaReporte).toLocaleString()} <br />
                  {n.tipoEmergencia && (
                    <>
                      <strong>Tipo:</strong> {n.tipoEmergencia}
                    </>
                  )}
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </Container>
  );
};

export default MapaNecesidades;
