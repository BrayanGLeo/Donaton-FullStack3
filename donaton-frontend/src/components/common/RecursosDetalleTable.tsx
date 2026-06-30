import React from 'react';
import { Table, Badge } from 'react-bootstrap';

interface RecursosDetalleTableProps {
  recursos: string | any[];
}

import { flattenResourceUnit } from '../../utils/unidadesLogic';

const extraAttributes = [
  { key: 'genero', label: 'Género' },
  { key: 'talla', label: 'Talla' },
  { key: 'tamano', label: 'Tamaño' },
  { key: 'etapa', label: 'Etapa' },
  { key: 'restriccionDietetica', label: 'Restricción' },
  { key: 'dimensiones', label: 'Medidas' },
  { key: 'litros', label: 'Capacidad' },
  { key: 'formatoQueso', label: 'Formato' }
];

const buildPalletSteps = (r: any, rawCant: number): string[] => {
  const steps: string[] = [];
  const envases = Number(r.cantidadEnvasePallet || 1);
  const cantEnvases = rawCant * envases;
  if (!r.tipoEnvasePallet) return steps;
  
  steps.push(`${cantEnvases} ${r.tipoEnvasePallet}`);
  if (r.tipoEnvasePallet === 'Cajas') {
    const uCaja = Number(r.unidadesPorEnvasePallet || 1);
    const cantSubEnvases = cantEnvases * uCaja;
    if (r.tipoEnvaseCajaPallet) {
      steps.push(`${cantSubEnvases} ${r.tipoEnvaseCajaPallet}`);
      if (r.tipoEnvaseCajaPallet === 'Paquetes' && r.unidadesPorPaquetePallet) {
        const uPaquete = Number(r.unidadesPorPaquetePallet);
        steps.push(`${cantSubEnvases * uPaquete} Unidades`);
      }
    }
  } else if (r.tipoEnvasePallet === 'Paquetes' && r.unidadesPorEnvasePallet && !r.pesoPorEnvasePallet) {
    steps.push(`${cantEnvases * Number(r.unidadesPorEnvasePallet)} Unidades`);
  }
  return steps;
};

const buildCajasSteps = (r: any, rawCant: number): string[] => {
  const steps: string[] = [];
  if (r.tipoEnvaseCaja && r.tipoEnvaseCaja !== 'Kilogramos') {
    const uEnvase = Number(r.unidadesPorEnvase || 1);
    const cantEnvases = rawCant * uEnvase;
    steps.push(`${cantEnvases} ${r.tipoEnvaseCaja}`);
    if (r.tipoEnvaseCaja === 'Paquetes' && r.unidadesPorPaquete) {
      const uPaquete = Number(r.unidadesPorPaquete);
      steps.push(`${cantEnvases * uPaquete} Unidades`);
    }
  }
  return steps;
};

const renderCantidad = (r: any) => {
  const unidadMedida = r.unidadMedida || r.unidad || 'Unidades';
  const rawCant = Number(r.cantidad || 0);
  let steps: string[] = [`${rawCant} ${unidadMedida}`];

  if (unidadMedida === 'Pallets') {
    steps = steps.concat(buildPalletSteps(r, rawCant));
  } else if (unidadMedida === 'Cajas') {
    steps = steps.concat(buildCajasSteps(r, rawCant));
  } else if (unidadMedida === 'Paquetes' && r.unidadesPorEnvase) {
    steps.push(`${rawCant * Number(r.unidadesPorEnvase)} Unidades`);
  }
  
  const { finalCantidad, finalUnidad } = flattenResourceUnit(r, rawCant);
  
  return (
    <div className="d-flex flex-column gap-1">
      {steps.map((step, i) => (
        <div 
          key={step} 
          style={{ 
            paddingLeft: `${i * 12}px`, 
            color: i === 0 ? '#212529' : '#6c757d',
            fontSize: i === 0 ? '1rem' : '0.875rem',
            fontWeight: i === 0 ? 600 : 400
          }}
        >
          {i > 0 && <span className="me-2 opacity-50">↳</span>}
          {step}
        </div>
      ))}
      <div className="mt-1 fw-bold text-primary border-top pt-2" style={{ fontSize: '0.9rem' }}>
        Total: {finalCantidad} {finalUnidad}
      </div>
    </div>
  );
};

const RecursoRow: React.FC<{ r: any; idx: number }> = ({ r, idx }) => {
  const extras: string[] = extraAttributes
    .filter(attr => r[attr.key])
    .map(attr => `${attr.label}: ${r[attr.key]}`);

  return (
    <tr key={`${r.categoria}-${r.subCategoria || r.recurso}-${idx}`}>
      <td className="px-3 py-3">
        <div className="fw-bold text-dark mb-1">{r.subCategoria || r.recurso || r.categoria}</div>
        <div className="text-muted small mb-2">{r.categoria}</div>
        {r.estadoArticulo && <Badge bg="secondary" className="fw-normal mb-1">{r.estadoArticulo}</Badge>}
        {r.fechaVencimiento && (
          <div className="text-muted" style={{ fontSize: '0.75rem' }}>
            Vence: {new Date(r.fechaVencimiento).toLocaleDateString()}
          </div>
        )}
      </td>
      <td className="px-3 py-3">
        {renderCantidad(r)}
      </td>
      <td className="px-3 py-3">
        {extras.length > 0 ? (
          <div className="d-flex flex-wrap gap-2">
            {extras.map((extra) => (
              <span key={extra} className="badge bg-light text-primary border border-primary-subtle">
                {extra}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-muted fst-italic small">No hay detalles adicionales</span>
        )}
      </td>
    </tr>
  );
};

export const RecursosDetalleTable: React.FC<RecursosDetalleTableProps> = ({ recursos }) => {
  let recs: any[] = [];
  
  if (typeof recursos === 'string') {
    try {
      recs = JSON.parse(recursos || '[]');
    } catch (e) {
      console.error('Error parseando recursos:', e);
      return <span className="text-muted fst-italic">Error al cargar recursos.</span>;
    }
  } else if (Array.isArray(recursos)) {
    recs = recursos;
  }

  if (!Array.isArray(recs) || recs.length === 0) {
    return <span className="text-muted fst-italic">No hay recursos especificados</span>;
  }

  return (
    <div className="table-responsive rounded shadow-sm bg-white" style={{ maxHeight: '350px', overflowY: 'auto' }}>
      <Table hover bordered className="mb-0 align-middle">
        <thead className="bg-light sticky-top">
          <tr>
            <th className="py-3 px-3">Recurso</th>
            <th className="py-3 px-3">Cant.</th>
            <th className="py-3 px-3">Atributos Especiales / Detalles</th>
          </tr>
        </thead>
        <tbody>
          {recs.map((r: any, idx: number) => (
            <RecursoRow key={`${r.categoria}-${r.subCategoria || r.recurso}-${idx}`} r={r} idx={idx} />
          ))}
        </tbody>
      </Table>
    </div>
  );
};
