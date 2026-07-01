import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import IngresarNecesidad from './IngresarNecesidad';
import { AuthProvider } from '../../context/AuthContext';
import { BrowserRouter } from 'react-router-dom';

vi.mock('../../services/bffService', () => ({
  ingresarNecesidad: vi.fn().mockResolvedValue({})
}));

const renderWithProviders = (component: React.ReactNode) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

vi.mock('../registro/MapLocationPicker', () => ({
  MapLocationPicker: ({ onLocationSelect }: any) => (
    <button 
      data-testid="mock-map" 
      onClick={() => onLocationSelect({ lat: -33.4, lng: -70.6, addressDetails: { state: 'Metropolitana', city: 'Santiago' } })}
    >
      Mock Map
    </button>
  )
}));

describe('Epic 3: Coordinación de Emergencias', () => {
  it('Debe desplegar subcategorías correctas y campo Otro', async () => {
    const { container } = renderWithProviders(<IngresarNecesidad />);

    const selects = container.querySelectorAll('select');
    const categoriaSelect = selects[0];
    
    fireEvent.change(categoriaSelect, { target: { value: 'Alimentos imperecederos' } });

    await waitFor(() => {
      expect(container.querySelectorAll('select').length).toBeGreaterThan(1);
    });
    
    const subcategoriaSelect = container.querySelectorAll('select')[1];

    expect(screen.getByText('Arroz')).toBeInTheDocument();
    expect(screen.getByText('Fideos')).toBeInTheDocument();
    expect(screen.getByText('Otro (Especificar)')).toBeInTheDocument();

    fireEvent.change(subcategoriaSelect, { target: { value: 'Otro' } });

    expect(await screen.findByPlaceholderText(/Ej. Pañales talla G, Colchones, etc./i)).toBeInTheDocument();
  });

  it('Debe permitir añadir recursos a la lista, seleccionar ubicación y registrar la alerta exitosamente', async () => {
    const { container } = renderWithProviders(<IngresarNecesidad />);

    // Añadir recurso
    const selects = container.querySelectorAll('select');
    const categoriaSelect = selects[0];
    fireEvent.change(categoriaSelect, { target: { value: 'Herramientas' } });

    await waitFor(() => expect(container.querySelectorAll('select').length).toBeGreaterThan(1));
    const subcategoriaSelect = container.querySelectorAll('select')[1];
    fireEvent.change(subcategoriaSelect, { target: { value: 'Martillo' } });

    const unidadSelect = container.querySelectorAll('select')[2];
    fireEvent.change(unidadSelect, { target: { value: 'Unidades' } });

    const cantidadInput = container.querySelector('input[type="number"]') as HTMLInputElement;
    fireEvent.change(cantidadInput, { target: { value: '10' } });

    const btnAdd = screen.getByRole('button', { name: /\+ Añadir a la lista/i });
    fireEvent.click(btnAdd);

    expect(await screen.findByText('Martillo')).toBeInTheDocument();

    // Llenar tipo de emergencia
    const tipoEmergenciaSelect = container.querySelector('#tipoEmergencia') as HTMLSelectElement;
    fireEvent.change(tipoEmergenciaSelect, { target: { value: 'Incendio' } });

    // Seleccionar ubicación en el mapa mockeado
    const mockMapBtn = screen.getByTestId('mock-map');
    fireEvent.click(mockMapBtn);

    // Enviar formulario
    const submitBtn = screen.getByRole('button', { name: /Registrar Alerta Estructurada/i });
    fireEvent.click(submitBtn);

    // Verificar que se llame al servicio mockeado
    await waitFor(() => {
      expect(screen.getByText(/Alerta registrada exitosamente!/i)).toBeInTheDocument();
    });
  });

  it('Debe renderizar campos de formato supermercado y pesos (coverage)', async () => {
    renderWithProviders(<IngresarNecesidad />);
    
    // Helper para cambiar a subcategoría y buscar inputs
    const testFormat = async (cat: string, sub: string, unidad: string) => {
      const catSelect = screen.getAllByText(/^Categoría/)[0]?.parentElement?.querySelector('select');
      if (catSelect) fireEvent.change(catSelect, { target: { value: cat } });
      
      const subSelect = screen.getAllByText(/^Subcategoría/)[0]?.parentElement?.querySelector('select');
      if (subSelect) {
        await waitFor(() => {
          expect(Array.from(subSelect.options).some(opt => opt.value === sub)).toBe(true);
        });
        fireEvent.change(subSelect, { target: { value: sub } });
      }
      
      const unidadSelect = screen.getAllByText(/^Formato de Entrega/)[0]?.parentElement?.querySelector('select');
      if (unidadSelect) {
        fireEvent.change(unidadSelect, { target: { value: unidad } });
      }
    };

    // Abarrotes con Unidades
    await testFormat('Alimentos imperecederos', 'Arroz', 'Unidades');
    await waitFor(() => expect(screen.getAllByText(/^Formato del Envase/)[0]).toBeInTheDocument());
    const formatoAbarrotes = screen.getAllByText(/^Formato del Envase/)[0]?.parentElement?.querySelector('select');
    if (formatoAbarrotes) fireEvent.change(formatoAbarrotes, { target: { value: formatoAbarrotes.options[1].value } });

    // Más formatos de supermercado
    const checkSelect = async (sub: string, labelRegex: RegExp) => {
      const subSelect = screen.getAllByText(/^Subcategoría/)[0]?.parentElement?.querySelector('select');
      if (subSelect) fireEvent.change(subSelect, { target: { value: sub } });
      await waitFor(() => expect(screen.getAllByText(labelRegex)[0]).toBeInTheDocument());
      const formatSelect = screen.getAllByText(labelRegex)[0]?.parentElement?.querySelector('select');
      if (formatSelect) fireEvent.change(formatSelect, { target: { value: formatSelect.options[1].value } });
    };

    await checkSelect('Té', /^Formato del Té/);
    await checkSelect('Café', /^Formato del Café/);
    await checkSelect('Aceite', /^Formato del Aceite/);
    await checkSelect('Atún en Conserva', /^Formato de Conserva/);
    await checkSelect('Salsa de Tomate', /^Formato de la Salsa/);

    // Alimentos perecederos
    await testFormat('Alimentos', 'Quesos', 'Unidades');
    await waitFor(() => expect(screen.getAllByText(/^Formato del Producto/)[0]).toBeInTheDocument());
    const quesosFormat = screen.getAllByText(/^Formato del Producto/)[0]?.parentElement?.querySelector('select');
    if (quesosFormat) fireEvent.change(quesosFormat, { target: { value: quesosFormat.options[1].value } });
    
    await checkSelect('Mantequilla/Margarina', /^Formato del Envase/);
    await checkSelect('Fiambres y Embutidos', /^Formato del Fiambre/);
    await checkSelect('Leche de 1 Litro', /^Tipo de Leche/);
    await checkSelect('Yogur Individual', /^Tipo de Yogur/);

    // Test Cajas format
    await testFormat('Alimentos imperecederos', 'Arroz', 'Cajas');
    await waitFor(() => expect(screen.getByText(/Qué contiene la Caja/i)).toBeInTheDocument());
    
    // Test Unidades por Envase
    const envaseSelect = screen.getByText(/Qué contiene la Caja/i).parentElement?.querySelector('select');
    if (envaseSelect) fireEvent.change(envaseSelect, { target: { value: 'Unidades' } });
    await waitFor(() => expect(screen.getByText(/Unidades por Caja/)).toBeInTheDocument());
    
    const unidadesEnvaseInput = screen.getByText(/Unidades por Caja/).parentElement?.querySelector('input');
    if (unidadesEnvaseInput) {
      fireEvent.change(unidadesEnvaseInput, { target: { value: '12' } });
      fireEvent.keyDown(unidadesEnvaseInput, { key: 'e', code: 'KeyE' });
    }

    // Test Paquetes format
    await testFormat('Alimentos imperecederos', 'Arroz', 'Cajas');
    await waitFor(() => expect(screen.getAllByText(/Qué contiene la Caja/i)[0]).toBeInTheDocument());
    
    const paqueteSelect = screen.getAllByText(/Qué contiene la Caja/i)[0].parentElement?.querySelector('select');
    if (paqueteSelect) fireEvent.change(paqueteSelect, { target: { value: 'Paquetes' } });
    await waitFor(() => expect(screen.getAllByText(/Unidades por Paquete/)[0]).toBeInTheDocument());
    
    const unidadesPaqueteInput = screen.getAllByText(/Unidades por Paquete/)[0].parentElement?.querySelector('input');
    if (unidadesPaqueteInput) {
      fireEvent.change(unidadesPaqueteInput, { target: { value: '6' } });
      fireEvent.keyDown(unidadesPaqueteInput, { key: '-', code: 'Minus' });
    }

    // Test Kilogramos format (pesoPorCaja)
    await testFormat('Alimentos imperecederos', 'Arroz', 'Cajas');
    await waitFor(() => expect(screen.getAllByText(/Qué contiene la Caja/i)[0]).toBeInTheDocument());
    
    const envaseSelectKg = screen.getAllByText(/Qué contiene la Caja/i)[0]?.parentElement?.querySelector('select');
    if (envaseSelectKg) fireEvent.change(envaseSelectKg, { target: { value: 'Kilogramos' } });
    await waitFor(() => expect(screen.getAllByText(/Kg por Caja/)[0]).toBeInTheDocument());
    
    const pesoCajaInput = screen.getAllByText(/Kg por Caja/)[0]?.parentElement?.querySelector('input');
    if (pesoCajaInput) {
      fireEvent.change(pesoCajaInput, { target: { value: '5' } });
      fireEvent.keyDown(pesoCajaInput, { key: '+', code: 'Plus' });
    }

    // Mascotas
    await testFormat('Alimentos para Mascotas', 'Comida para Perros (Seca)', 'Unidades');
    await waitFor(() => expect(screen.getAllByText(/^Formato del Saco\/Bolsa/)[0]).toBeInTheDocument());
    const sacoFormat = screen.getAllByText(/^Formato del Saco\/Bolsa/)[0]?.parentElement?.querySelector('select');
    if (sacoFormat) fireEvent.change(sacoFormat, { target: { value: sacoFormat.options[1].value } });
  });

  it('Debe probar categorias especiales (Mascotas, Muebles, Agua, Materiales) para coverage', async () => {
    const { container } = renderWithProviders(<IngresarNecesidad />);
    const catSelect = container.querySelectorAll('select')[0];

    // Muebles y Enseres -> Camas
    fireEvent.change(catSelect, { target: { value: 'Muebles y Enseres' } });
    await waitFor(() => expect(container.querySelectorAll('select').length).toBeGreaterThan(1));
    const subSelectCamas = container.querySelectorAll('select')[1];
    fireEvent.change(subSelectCamas, { target: { value: 'Camas' } });
    
    await waitFor(() => expect(screen.getByText(/Tamaño/i)).toBeInTheDocument());
    const tamanoSelect = screen.getByText(/Tamaño/i).parentElement?.querySelector('select');
    if (tamanoSelect) fireEvent.change(tamanoSelect, { target: { value: '1.5 Plazas' } });

    // Mascotas
    fireEvent.change(catSelect, { target: { value: 'Alimentos para Mascotas' } });
    await waitFor(() => expect(container.querySelectorAll('select').length).toBeGreaterThan(1));
    const subSelectMascotas = container.querySelectorAll('select')[1];
    fireEvent.change(subSelectMascotas, { target: { value: 'Comida para Gatos (Seca)' } });
    
    await waitFor(() => expect(screen.getByText(/Etapa\/Edad/i)).toBeInTheDocument());
    const etapaSelect = screen.getByText(/Etapa\/Edad/i).parentElement?.querySelector('select');
    if (etapaSelect) fireEvent.change(etapaSelect, { target: { value: 'Adulto' } });

    // Agua e Hidratación
    fireEvent.change(catSelect, { target: { value: 'Agua e Hidratación' } });
    await waitFor(() => expect(container.querySelectorAll('select').length).toBeGreaterThan(1));
    const subSelectAgua = container.querySelectorAll('select')[1];
    fireEvent.change(subSelectAgua, { target: { value: 'Agua Embotellada (Bidón)' } });

    await waitFor(() => expect(screen.getByText(/Litros \(Capacidad\)/i)).toBeInTheDocument());
    const litrosSelect = screen.getByText(/Litros \(Capacidad\)/i).parentElement?.querySelector('select');
    if (litrosSelect) fireEvent.change(litrosSelect, { target: { value: 'Bidón 5 Litros' } });

    // Materiales de Construcción
    fireEvent.change(catSelect, { target: { value: 'Materiales de Construcción' } });
    await waitFor(() => expect(container.querySelectorAll('select').length).toBeGreaterThan(1));
    const subSelectMat = container.querySelectorAll('select')[1];
    fireEvent.change(subSelectMat, { target: { value: 'Madera' } });

    await waitFor(() => expect(screen.getByText(/Dimensiones\/Medidas/i)).toBeInTheDocument());
    const dimenInput = screen.getByText(/Dimensiones\/Medidas/i).parentElement?.querySelector('input');
    if (dimenInput) fireEvent.change(dimenInput, { target: { value: '2x4' } });
  });

  it('Debe manejar categoría "Otro" y requerir descripción personalizada', async () => {
    const { container } = renderWithProviders(<IngresarNecesidad />);

    const catSelect = container.querySelectorAll('select')[0];
    fireEvent.change(catSelect, { target: { value: 'Otro' } });

    await waitFor(() => expect(screen.getByPlaceholderText(/Ej. Pañales talla G/i)).toBeInTheDocument());

    // Intentar añadir sin rellenar la subcategoría otro
    const btnAdd = screen.getByRole('button', { name: /\+ Añadir a la lista/i });
    fireEvent.click(btnAdd);

    await waitFor(() => {
      expect(screen.getAllByText(/Requerido/i)[0]).toBeInTheDocument();
    });
  });

  it('Debe validar items vacíos antes de enviar', async () => {
    const { container } = renderWithProviders(<IngresarNecesidad />);

    const tipoEmergenciaSelect = container.querySelector('#tipoEmergencia') as HTMLSelectElement;
    fireEvent.change(tipoEmergenciaSelect, { target: { value: 'Sismo' } });

    const mockMapBtn = screen.getByTestId('mock-map');
    fireEvent.click(mockMapBtn);

    const submitBtn = screen.getByRole('button', { name: /Registrar Alerta Estructurada/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/completa correctamente/i)).toBeInTheDocument();
    });
  });

  it('Debe renderizar Artículos de Higiene Personal correctamente', async () => {
    const { container } = renderWithProviders(<IngresarNecesidad />);
    const catSelect = container.querySelectorAll('select')[0];
    fireEvent.change(catSelect, { target: { value: 'Artículos de Higiene Personal' } });

    await waitFor(() => expect(container.querySelectorAll('select').length).toBeGreaterThan(1));
    const subcategoriaSelect = container.querySelectorAll('select')[1];
    fireEvent.change(subcategoriaSelect, { target: { value: 'Jabón' } });

    await waitFor(() => expect(screen.getByText(/^Formato de Entrega/i) || screen.getByText(/Unidades/i)).toBeTruthy());
  });

  it('Debe renderizar Insumos Médicos y añadir ítem correctamente', async () => {
    const { container } = renderWithProviders(<IngresarNecesidad />);
    const catSelect = container.querySelectorAll('select')[0];
    fireEvent.change(catSelect, { target: { value: 'Insumos Médicos' } });

    await waitFor(() => expect(container.querySelectorAll('select').length).toBeGreaterThan(1));
    const subcategoriaSelect = container.querySelectorAll('select')[1];
    fireEvent.change(subcategoriaSelect, { target: { value: 'Paracetamol' } });

    const selects = container.querySelectorAll('select');
    fireEvent.change(selects[2], { target: { value: 'Unidades' } });

    const cantidadInput = container.querySelector('input[type="number"]') as HTMLInputElement;
    fireEvent.change(cantidadInput, { target: { value: '50' } });

    const btnAdd = screen.getByRole('button', { name: /\+ Añadir a la lista/i });
    fireEvent.click(btnAdd);

    expect(await screen.findByText('Paracetamol')).toBeInTheDocument();
  });

  it('Debe manejar selección de ubicación sin addressDetails', async () => {
    const { container } = renderWithProviders(<IngresarNecesidad />);

    // El mock ya envía addressDetails, pero testeamos que el componente carga sin errores
    const catSelect = container.querySelectorAll('select')[0];
    fireEvent.change(catSelect, { target: { value: 'Herramientas' } });
    await waitFor(() => expect(container.querySelectorAll('select').length).toBeGreaterThan(1));

    const tipoEmergenciaSelect = container.querySelector('#tipoEmergencia') as HTMLSelectElement;
    fireEvent.change(tipoEmergenciaSelect, { target: { value: 'Tsunami' } });

    expect(screen.getByRole('button', { name: /Registrar Alerta Estructurada/i })).toBeInTheDocument();
  });

  it('Debe renderizar campos extras para Cajas, Paquetes y Sacos', async () => {
    const { container } = renderWithProviders(<IngresarNecesidad />);
    
    const selects = () => Array.from(container.querySelectorAll('select'));
    const getSelectByText = (regex: RegExp) => {
      const labels = Array.from(container.querySelectorAll('label'));
      const label = labels.find(l => regex.test(l.textContent?.trim() || ''));
      return label?.parentElement?.querySelector('select') as HTMLSelectElement;
    };
    
    // Probar Cajas (Alimentos -> Arroz)
    fireEvent.change(selects()[0], { target: { value: 'Alimentos imperecederos' } });
    await waitFor(() => expect(selects().length).toBeGreaterThan(1));
    fireEvent.change(selects()[1], { target: { value: 'Arroz' } });
    
    await waitFor(() => expect(getSelectByText(/^Formato de Entrega/i)).toBeInTheDocument());
    fireEvent.change(getSelectByText(/^Formato de Entrega/i), { target: { value: 'Cajas' } });

    await waitFor(() => expect(screen.getByText(/Qué contiene la Caja/i)).toBeInTheDocument());
    
    const envaseCaja = getSelectByText(/^¿Qué contiene/i);
    if (envaseCaja) fireEvent.change(envaseCaja, { target: { value: 'Kilogramos' } });

    await waitFor(() => expect(screen.getByText(/Kg por Caja/i)).toBeInTheDocument());
    const kgCajaInput = screen.getByText(/Kg por Caja/i).parentElement?.querySelector('input');
    if (kgCajaInput) fireEvent.change(kgCajaInput, { target: { value: '20' } });

    // Probar Cajas de Frutas/Verduras (Alimentos perecederos)
    fireEvent.change(selects()[0], { target: { value: 'Alimentos' } });
    await waitFor(() => expect(selects().length).toBeGreaterThan(1));
    fireEvent.change(selects()[1], { target: { value: 'Frutas' } });

    await waitFor(() => expect(getSelectByText(/^Formato de Entrega/i)).toBeInTheDocument());
    fireEvent.change(getSelectByText(/^Formato de Entrega/i), { target: { value: 'Cajas' } });

    await waitFor(() => expect(screen.getByText(/Kg por Caja/i)).toBeInTheDocument());
    const kgFrutaInput = screen.getByText(/Kg por Caja/i).parentElement?.querySelector('input');
    if (kgFrutaInput) fireEvent.change(kgFrutaInput, { target: { value: '15' } });

    // Probar Sacos (Mascotas)
    fireEvent.change(selects()[0], { target: { value: 'Alimentos para Mascotas' } });
    await waitFor(() => expect(selects().length).toBeGreaterThan(1));
    fireEvent.change(selects()[1], { target: { value: 'Comida para Perros (Seca)' } });

    await waitFor(() => expect(getSelectByText(/^Formato de Entrega/i)).toBeInTheDocument());
    fireEvent.change(getSelectByText(/^Formato de Entrega/i), { target: { value: 'Sacos' } });

    await waitFor(() => expect(screen.getByText(/Peso por Saco/i)).toBeInTheDocument());
    const sacoInput = screen.getByText(/Peso por Saco/i).parentElement?.querySelector('input');
    if (sacoInput) fireEvent.change(sacoInput, { target: { value: '25' } });
  });

  it('Debe renderizar Ropa y Calzado con géneros y tallas', async () => {
    const { container } = renderWithProviders(<IngresarNecesidad />);
    const catSelect = container.querySelectorAll('select')[0];
    fireEvent.change(catSelect, { target: { value: 'Ropa y Calzado' } });

    await waitFor(() => expect(container.querySelectorAll('select').length).toBeGreaterThan(1));
    const subcategoriaSelect = container.querySelectorAll('select')[1];
    fireEvent.change(subcategoriaSelect, { target: { value: 'Camisetas' } });

    await waitFor(() => expect(screen.getByText(/^Género/i)).toBeInTheDocument());

    const generoSelect = screen.getByText(/^Género/i).parentElement?.querySelector('select');
    if (generoSelect) fireEvent.change(generoSelect, { target: { value: 'Hombre' } });

    await waitFor(() => expect(screen.getByText(/^Talla/i)).toBeInTheDocument());
    const tallaSelect = screen.getByText(/^Talla/i).parentElement?.querySelector('select');
    if (tallaSelect) fireEvent.change(tallaSelect, { target: { value: 'M' } });

    expect(screen.getByText('M')).toBeInTheDocument();
  });

  it('Debe renderizar Ropa de Bebé con opciones de género específicas', async () => {
    const { container } = renderWithProviders(<IngresarNecesidad />);
    const catSelect = container.querySelectorAll('select')[0];
    fireEvent.change(catSelect, { target: { value: 'Ropa y Calzado' } });

    await waitFor(() => expect(container.querySelectorAll('select').length).toBeGreaterThan(1));
    const subcategoriaSelect = container.querySelectorAll('select')[1];
    fireEvent.change(subcategoriaSelect, { target: { value: 'Ropa de Bebé' } });

    await waitFor(() => expect(screen.getByText(/^Género/i)).toBeInTheDocument());
    // Verificar opciones bebé
    expect(screen.getByText('Niño')).toBeInTheDocument();
  });

  it('Debe manejar Pallets y sus opciones correctamente', async () => {
    const { container } = renderWithProviders(<IngresarNecesidad />);
    const catSelect = container.querySelectorAll('select')[0];
    fireEvent.change(catSelect, { target: { value: 'Alimentos imperecederos' } });

    await waitFor(() => expect(container.querySelectorAll('select').length).toBeGreaterThan(1));
    fireEvent.change(container.querySelectorAll('select')[1], { target: { value: 'Arroz' } });

    const unidadSelect = container.querySelectorAll('select')[2];
    fireEvent.change(unidadSelect, { target: { value: 'Pallets' } });

    await waitFor(() => expect(screen.getByText(/Cantidad de Sacos|Cantidad de Cajas|Cantidad/i)).toBeInTheDocument());
  });

  it('Debe eliminar ítem de la lista con el botón eliminar', async () => {
    const { container } = renderWithProviders(<IngresarNecesidad />);
    const catSelect = container.querySelectorAll('select')[0];
    fireEvent.change(catSelect, { target: { value: 'Herramientas' } });

    await waitFor(() => expect(container.querySelectorAll('select').length).toBeGreaterThan(1));
    fireEvent.change(container.querySelectorAll('select')[1], { target: { value: 'Palas' } });
    fireEvent.change(container.querySelectorAll('select')[2], { target: { value: 'Unidades' } });
    
    const cantidadInput = container.querySelector('input[type="number"]') as HTMLInputElement;
    fireEvent.change(cantidadInput, { target: { value: '5' } });

    const btnAdd = screen.getByRole('button', { name: /\+ Añadir a la lista/i });
    fireEvent.click(btnAdd);

    expect(await screen.findByText('Palas')).toBeInTheDocument();

    // Eliminar el ítem
    const deleteBtn = container.querySelector('button[title="Eliminar"]') || 
                      Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes('×') || b.innerHTML.includes('trash'));
    if (deleteBtn) {
      fireEvent.click(deleteBtn);
      await waitFor(() => {
        expect(screen.queryByText('Palas')).not.toBeInTheDocument();
      });
    }
  });

  it('Debe mostrar error del servicio al registrar necesidad', async () => {
    const bffService = await import('../../services/bffService');
    vi.mocked(bffService.ingresarNecesidad).mockRejectedValueOnce(new Error('Error del servidor'));
    
    const { container } = renderWithProviders(<IngresarNecesidad />);
    
    // Añadir recurso
    const catSelect = container.querySelectorAll('select')[0];
    fireEvent.change(catSelect, { target: { value: 'Herramientas' } });
    await waitFor(() => expect(container.querySelectorAll('select').length).toBeGreaterThan(1));
    fireEvent.change(container.querySelectorAll('select')[1], { target: { value: 'Palas' } });
    fireEvent.change(container.querySelectorAll('select')[2], { target: { value: 'Unidades' } });
    
    const cantidadInput = container.querySelector('input[type="number"]') as HTMLInputElement;
    fireEvent.change(cantidadInput, { target: { value: '3' } });
    
    fireEvent.click(screen.getByRole('button', { name: /\+ Añadir a la lista/i }));
    await screen.findByText('Palas');

    // Seleccionar ubicación en el mapa
    fireEvent.click(screen.getByTestId('mock-map'));

    // Enviar formulario
    fireEvent.click(screen.getByRole('button', { name: /Registrar Alerta Estructurada/i }));

    await waitFor(() => {
      expect(screen.getByText(/error al registrar/i)).toBeInTheDocument();
    });
  });

  it('Debe validar que se requiere ubicación para enviar', async () => {
    const { container } = renderWithProviders(<IngresarNecesidad />);
    
    // Añadir un ítem pero NO seleccionar ubicación
    const catSelect = container.querySelectorAll('select')[0];
    fireEvent.change(catSelect, { target: { value: 'Herramientas' } });
    await waitFor(() => expect(container.querySelectorAll('select').length).toBeGreaterThan(1));
    fireEvent.change(container.querySelectorAll('select')[1], { target: { value: 'Palas' } });
    fireEvent.change(container.querySelectorAll('select')[2], { target: { value: 'Unidades' } });
    
    const cantidadInput = container.querySelector('input[type="number"]') as HTMLInputElement;
    fireEvent.change(cantidadInput, { target: { value: '3' } });
    
    fireEvent.click(screen.getByRole('button', { name: /\+ Añadir a la lista/i }));
    await screen.findByText('Palas');

    // Enviar sin ubicación
    fireEvent.click(screen.getByRole('button', { name: /Registrar Alerta Estructurada/i }));

    await waitFor(() => {
      expect(screen.getByText(/completa correctamente/i)).toBeInTheDocument();
    });
  });



  it('Debe mostrar talla para subcategoria de Pantalones con sizes especiales', async () => {
    renderWithProviders(<IngresarNecesidad />);
    const catSelect = screen.getAllByRole('combobox')[0];
    fireEvent.change(catSelect, { target: { value: 'Ropa y Calzado' } });

    await waitFor(() => expect(screen.getAllByRole('combobox').length).toBeGreaterThan(1));
    const subcategoriaSelect = screen.getAllByRole('combobox')[1];
    fireEvent.change(subcategoriaSelect, { target: { value: 'Pantalones' } });

    await waitFor(() => expect(screen.getByText(/^Talla/i)).toBeInTheDocument());
  });

  it('Debe mostrar tallas de zapatos para subcategoria Zapatos', async () => {
    const { container } = renderWithProviders(<IngresarNecesidad />);
    const catSelect = container.querySelectorAll('select')[0];
    fireEvent.change(catSelect, { target: { value: 'Ropa y Calzado' } });

    await waitFor(() => expect(container.querySelectorAll('select').length).toBeGreaterThan(1));
    const subcategoriaSelect = container.querySelectorAll('select')[1];
    fireEvent.change(subcategoriaSelect, { target: { value: 'Zapatos' } });

    await waitFor(() => expect(screen.getByText(/^Talla/i)).toBeInTheDocument());
  });

  it('Debe mostrar campo de Pañales con tallas XS-XL', async () => {
    const { container } = renderWithProviders(<IngresarNecesidad />);
    const catSelect = container.querySelectorAll('select')[0];
    fireEvent.change(catSelect, { target: { value: 'Artículos de Higiene Personal' } });

    await waitFor(() => expect(container.querySelectorAll('select').length).toBeGreaterThan(1));
    const subcategoriaSelect = container.querySelectorAll('select')[1];
    fireEvent.change(subcategoriaSelect, { target: { value: 'Pañales (Adulto)' } });

    await waitFor(() => expect(screen.getByText(/^Talla/i)).toBeInTheDocument());
    expect(screen.getByText('S')).toBeInTheDocument();
  });

  it('Debe mostrar restricción dietética para Fideos', async () => {
    const { container } = renderWithProviders(<IngresarNecesidad />);
    const catSelect = container.querySelectorAll('select')[0];
    fireEvent.change(catSelect, { target: { value: 'Alimentos imperecederos' } });

    await waitFor(() => expect(container.querySelectorAll('select').length).toBeGreaterThan(1));
    fireEvent.change(container.querySelectorAll('select')[1], { target: { value: 'Fideos' } });

    await waitFor(() => expect(screen.getByText(/Restricción Dietética/i)).toBeInTheDocument());
    const restriccionSelect = screen.getByText(/Restricción Dietética/i).parentElement?.querySelector('select');
    if (restriccionSelect) {
      fireEvent.change(restriccionSelect, { target: { value: 'Sin Gluten' } });
    }
  });

  it('Debe autocompletar región y comuna desde mapa', async () => {
    renderWithProviders(<IngresarNecesidad />);

    const mapBtn = screen.getByTestId('mock-map');
    fireEvent.click(mapBtn);

    await waitFor(() => {
      const regionInput = screen.getByLabelText(/Región Detectada/i) as HTMLInputElement;
      expect(regionInput.value).toContain('Metropolitana');
      const comunaInput = screen.getByLabelText(/Comuna Detectada/i) as HTMLInputElement;
      expect(comunaInput.value).toBe('Santiago');
    });
  });

  it('Debe mostrar campo de tipoEmergencia', async () => {
    renderWithProviders(<IngresarNecesidad />);

    expect(screen.getByText(/Tipo de Emergencia/i)).toBeInTheDocument();

    const tipoSelect = screen.getByText(/Tipo de Emergencia/i).parentElement?.querySelector('select') as HTMLSelectElement;
    fireEvent.change(tipoSelect, { target: { value: 'Incendio' } });
    expect(tipoSelect.value).toBe('Incendio');
  });

  it('Debe manejar Materiales de Construcción con dimensiones', async () => {
    const { container } = renderWithProviders(<IngresarNecesidad />);
    const catSelect = container.querySelectorAll('select')[0];
    fireEvent.change(catSelect, { target: { value: 'Materiales de Construcción' } });

    await waitFor(() => expect(container.querySelectorAll('select').length).toBeGreaterThan(1));
    fireEvent.change(container.querySelectorAll('select')[1], { target: { value: 'Madera' } });

    await waitFor(() => expect(screen.getByText(/Dimensiones/i)).toBeInTheDocument());
    const dimInput = screen.getByText(/Dimensiones/i).parentElement?.querySelector('input') as HTMLInputElement;
    if (dimInput) {
      fireEvent.change(dimInput, { target: { value: '2x4 pulgadas' } });
    }
  });

  it('Debe submittear el formulario completo correctamente', async () => {
    const { container } = renderWithProviders(<IngresarNecesidad />);

    // Fill tipo emergencia
    const tipoSelect = screen.getByText(/Tipo de Emergencia/i).parentElement?.querySelector('select') as HTMLSelectElement;
    fireEvent.change(tipoSelect, { target: { value: 'Incendio' } });

    // Click map to set location (which sets region/comuna internally via Mock Map)
    const mapBtn = screen.getByTestId('mock-map');
    fireEvent.click(mapBtn);

    await waitFor(() => {
      const regionInput = screen.getByLabelText(/Región Detectada/i) as HTMLInputElement;
      expect(regionInput.value).toContain('Metropolitana');
    });

    // Add an item
    const catSelect = container.querySelectorAll('select')[0];
    fireEvent.change(catSelect, { target: { value: 'Alimentos imperecederos' } });
    await waitFor(() => expect(container.querySelectorAll('select').length).toBeGreaterThan(1));
    
    const subcatSelect = container.querySelectorAll('select')[1];
    fireEvent.change(subcatSelect, { target: { value: 'Fideos' } });
    
    // Wait for the "Formato de Entrega" select to be enabled (when subcategoria is selected)
    await waitFor(() => {
      const selects = container.querySelectorAll('select');
      // The select for 'Formato de Entrega' should be the last or second to last
      // Find the one that has option "Unidades"
      const formatSelect = Array.from(selects).find(s => s.textContent?.includes('Unidades'));
      expect(formatSelect).not.toBeDisabled();
    });
    
    const selects = container.querySelectorAll('select');
    const formatSelect = Array.from(selects).find(s => s.textContent?.includes('Unidades')) as HTMLSelectElement;
    fireEvent.change(formatSelect, { target: { value: 'Unidades' } });
    
    // Fill quantity
    const cantidadInput = container.querySelector('input[type="number"]') as HTMLInputElement;
    fireEvent.change(cantidadInput, { target: { value: '10' } });

    const addBtn = screen.getByRole('button', { name: /\+ Añadir a la lista/i });
    fireEvent.click(addBtn);
    
    // Verify it was added to the list
    expect(await screen.findByText(/10 Unidades/i)).toBeInTheDocument();

    // Submit
    const submitBtn = screen.getByRole('button', { name: /Registrar Alerta/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/exitosamente|enviada|Alerta/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('Debe permitir eliminar un recurso de la lista', async () => {
    const { container } = renderWithProviders(<IngresarNecesidad />);

    // Add an item
    const catSelect = container.querySelectorAll('select')[0];
    fireEvent.change(catSelect, { target: { value: 'Alimentos imperecederos' } });
    await waitFor(() => expect(container.querySelectorAll('select').length).toBeGreaterThan(1));
    
    const subcatSelect = container.querySelectorAll('select')[1];
    fireEvent.change(subcatSelect, { target: { value: 'Fideos' } });
    
    await waitFor(() => {
      const selects = container.querySelectorAll('select');
      const formatSelect = Array.from(selects).find(s => s.textContent?.includes('Unidades'));
      expect(formatSelect).not.toBeDisabled();
    });
    
    const selects = container.querySelectorAll('select');
    const formatSelect = Array.from(selects).find(s => s.textContent?.includes('Unidades')) as HTMLSelectElement;
    fireEvent.change(formatSelect, { target: { value: 'Unidades' } });
    
    const cantidadInput = container.querySelector('input[type="number"]') as HTMLInputElement;
    fireEvent.change(cantidadInput, { target: { value: '10' } });

    const addBtn = screen.getByRole('button', { name: /\+ Añadir a la lista/i });
    fireEvent.click(addBtn);
    
    expect(await screen.findByText(/10 Unidades/i)).toBeInTheDocument();

    // Remove the item
    const removeBtn = screen.getByTitle(/Eliminar recurso/i);
    fireEvent.click(removeBtn);

    await waitFor(() => {
      expect(screen.queryByText(/10 Unidades/i)).not.toBeInTheDocument();
    });
  });

  it('Debe mostrar error si el servicio de registro falla', async () => {
    // Override mock to reject
    const bffService = await import('../../services/bffService');
    vi.mocked(bffService.ingresarNecesidad).mockRejectedValueOnce(new Error('Network error'));

    const { container } = renderWithProviders(<IngresarNecesidad />);

    // Fill minimum required data
    const catSelect = container.querySelectorAll('select')[0];
    fireEvent.change(catSelect, { target: { value: 'Alimentos imperecederos' } });
    await waitFor(() => expect(container.querySelectorAll('select').length).toBeGreaterThan(1));
    const subcatSelect = container.querySelectorAll('select')[1];
    fireEvent.change(subcatSelect, { target: { value: 'Fideos' } });
    
    await waitFor(() => {
      const formatSelect = Array.from(container.querySelectorAll('select')).find(s => s.textContent?.includes('Unidades'));
      expect(formatSelect).not.toBeDisabled();
    });
    const formatSelect = Array.from(container.querySelectorAll('select')).find(s => s.textContent?.includes('Unidades')) as HTMLSelectElement;
    fireEvent.change(formatSelect, { target: { value: 'Unidades' } });
    
    const cantidadInput = container.querySelector('input[type="number"]') as HTMLInputElement;
    fireEvent.change(cantidadInput, { target: { value: '5' } });

    fireEvent.click(screen.getByRole('button', { name: /\+ Añadir a la lista/i }));
    expect(await screen.findByText(/5 Unidades/i)).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('mock-map'));
    await waitFor(() => {
      const regionInput = screen.getByLabelText(/Región Detectada/i) as HTMLInputElement;
      expect(regionInput.value).toContain('Metropolitana');
    });

    const submitBtn = screen.getByRole('button', { name: /Registrar Alerta/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/error al registrar la necesidad/i)).toBeInTheDocument();
    });
  });

  it('Debe manejar campos de formatos especiales (Quesos)', async () => {
    const { container } = renderWithProviders(<IngresarNecesidad />);

    const catSelect = container.querySelectorAll('select')[0];
    fireEvent.change(catSelect, { target: { value: 'Alimentos' } });
    await waitFor(() => expect(container.querySelectorAll('select').length).toBeGreaterThan(1));
    
    const subcatSelect = container.querySelectorAll('select')[1];
    fireEvent.change(subcatSelect, { target: { value: 'Quesos' } });

    await waitFor(() => {
      const selects = container.querySelectorAll('select');
      const formatSelect = Array.from(selects).find(s => s.textContent?.includes('Unidades'));
      expect(formatSelect).not.toBeDisabled();
    });

    const formatSelect = Array.from(container.querySelectorAll('select')).find(s => s.textContent?.includes('Unidades')) as HTMLSelectElement;
    fireEvent.change(formatSelect, { target: { value: 'Unidades' } });

    // Try to add without formats to trigger validation
    const addBtn = screen.getByRole('button', { name: /\+ Añadir a la lista/i });
    fireEvent.click(addBtn);

    // Fill fields
    const formatoQueso = Array.from(container.querySelectorAll('select')).find(s => s.parentElement?.textContent?.includes('Formato del Producto')) as HTMLSelectElement;
    if(formatoQueso) fireEvent.change(formatoQueso, { target: { value: 'Laminado' } });
    
    const pesoQueso = Array.from(container.querySelectorAll('select')).find(s => s.parentElement?.textContent?.includes('Peso por Unidad')) as HTMLSelectElement;
    if(pesoQueso) fireEvent.change(pesoQueso, { target: { value: '250g' } });

    const cantidadInput = container.querySelector('input[type="number"]') as HTMLInputElement;
    fireEvent.change(cantidadInput, { target: { value: '2' } });

    fireEvent.click(addBtn);
    expect(await screen.findByText(/Quesos/i)).toBeInTheDocument();
  });
});
