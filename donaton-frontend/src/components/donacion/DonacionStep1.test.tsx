import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { DonacionStep1 } from './DonacionStep1';
import { donacionGlobalSchema, type DonacionGlobalValues } from './DonacionSchemas';

const TestWrapper = () => {
  const methods = useForm<DonacionGlobalValues>({
    resolver: zodResolver(donacionGlobalSchema),
    defaultValues: {
      categoria: '',
      subCategoria: '',
      nombreArticulo: '',
      unidadMedida: '',
      estadoArticulo: '',
      visibilidad: 'Publica',
    } as any
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(() => {})}>
        <DonacionStep1 />
        <button type="submit">Siguiente</button>
      </form>
    </FormProvider>
  );
};

describe('Epic 2: Control y Validación de Donaciones', () => {
  it('Debe bloquear alimentos vencidos mostrando un error', async () => {
    const { container } = render(<TestWrapper />);

    const catSelect = container.querySelector('select[name="categoria"]') as HTMLSelectElement;
    fireEvent.change(catSelect, { target: { value: 'Alimentos' } });

    await waitFor(() => expect(container.querySelector('select[name="subCategoria"]')).toBeInTheDocument());
    const subCatSelect = container.querySelector('select[name="subCategoria"]') as HTMLSelectElement;
    fireEvent.change(subCatSelect, { target: { value: 'Comida Preparada' } });

    const unidadMedida = container.querySelector('select[name="unidadMedida"]') as HTMLSelectElement;
    fireEvent.change(unidadMedida, { target: { value: 'Unidades' } });
    
    const cantidad = container.querySelector('input[name="cantidad"]') as HTMLInputElement;
    fireEvent.change(cantidad, { target: { value: '10' } });
    
    const descripcion = container.querySelector('textarea[name="descripcion"]') as HTMLTextAreaElement;
    fireEvent.change(descripcion, { target: { value: 'Test desc' } });

    const dateInput = container.querySelector('input[name="fechaVencimiento"]') as HTMLInputElement;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    fireEvent.change(dateInput, { target: { value: yesterday.toISOString().split('T')[0] } });

    fireEvent.click(screen.getByText('Siguiente'));

    expect(await screen.findByText('La fecha debe ser posterior a hoy')).toBeInTheDocument();
  });

  it('No debe exigir fecha de caducidad para Ropa y Calzado', async () => {
    const { container } = render(<TestWrapper />);

    const catSelect = container.querySelector('select[name="categoria"]') as HTMLSelectElement;
    fireEvent.change(catSelect, { target: { value: 'Ropa y Calzado' } });

    expect(container.querySelector('input[name="fechaVencimiento"]')).not.toBeInTheDocument();
  });
});
