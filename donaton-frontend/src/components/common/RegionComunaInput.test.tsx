import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RegionComunaInput } from './RegionComunaInput';

vi.mock('react-select', () => ({
  components: {
    Input: (props: any) => <input {...props} data-testid="react-select-input" />
  }
}));

describe('RegionComunaInput', () => {
  it('debería permitir letras y limpiar caracteres no deseados', () => {
    const mockOnChange = vi.fn();
    
    const dummyProps: any = {
      onChange: mockOnChange,
    };

    render(<RegionComunaInput {...dummyProps} />);
    
    const input = screen.getByTestId('react-select-input');
    
    fireEvent.change(input, { target: { value: 'Santiago' } });
    expect(input).toHaveValue('Santiago');
    expect(mockOnChange).toHaveBeenCalled();
    
    fireEvent.change(input, { target: { value: 'Santiago123' } });
    expect(input).toHaveValue('Santiago');
    
    fireEvent.change(input, { target: { value: ' Santiago' } });
    expect(input).toHaveValue('Santiago');
    
    fireEvent.change(input, { target: { value: 'San  tiago' } });
    expect(input).toHaveValue('San tiago');
  });
});
