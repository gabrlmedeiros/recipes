import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import LoginScreen from '../../app/(auth)/login';
import { authService } from '../../src/modules/auth/auth.service';
import { storage } from '../../src/shared/storage/storage';

const mockReplace = jest.fn();
const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace, push: mockPush }),
}));

jest.mock('../../src/modules/auth/auth.service', () => ({
  authService: {
    login: jest.fn(),
  },
}));

jest.mock('../../src/shared/storage/storage', () => ({
  storage: {
    setToken: jest.fn(),
    getToken: jest.fn(),
    removeToken: jest.fn(),
  },
}));

const mockAuthResult = {
  token: 'mock-token',
  user: { id: '1', name: 'João Silva', login: 'joaosilva' },
};

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(async () => null),
    setItem: jest.fn(async () => null),
    removeItem: jest.fn(async () => null),
    clear: jest.fn(async () => null),
  },
}));
describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renderiza os campos de login e senha', () => {
    render(<LoginScreen />);

    expect(screen.getByPlaceholderText('Seu login')).toBeTruthy();
    expect(screen.getByPlaceholderText('Sua senha')).toBeTruthy();
    expect(screen.getByText('Entrar')).toBeTruthy();
  });

  it('exibe o título de boas-vindas', () => {
    render(<LoginScreen />);
    expect(screen.getByText('Bem-vindo de volta')).toBeTruthy();
  });

  it('chama authService.login com os dados preenchidos', async () => {
    jest.mocked(authService.login).mockResolvedValue(mockAuthResult);
    jest.mocked(storage.setToken).mockResolvedValue(undefined);

    render(<LoginScreen />);

    fireEvent.changeText(screen.getByPlaceholderText('Seu login'), 'joaosilva');
    fireEvent.changeText(screen.getByPlaceholderText('Sua senha'), 'senha123');
    fireEvent.press(screen.getByText('Entrar'));

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith('joaosilva', 'senha123');
    });
  });

  it('salva o token no storage após login bem-sucedido', async () => {
    jest.mocked(authService.login).mockResolvedValue(mockAuthResult);
    jest.mocked(storage.setToken).mockResolvedValue(undefined);

    render(<LoginScreen />);

    fireEvent.changeText(screen.getByPlaceholderText('Seu login'), 'joaosilva');
    fireEvent.changeText(screen.getByPlaceholderText('Sua senha'), 'senha123');
    fireEvent.press(screen.getByText('Entrar'));

    await waitFor(() => {
      expect(storage.setToken).toHaveBeenCalledWith('mock-token');
    });
  });

  it('exibe mensagem de erro quando o login falha', async () => {
    const error = {
      response: { data: { error: { message: 'Login ou senha inválidos' } } },
    };
    jest.mocked(authService.login).mockRejectedValue(error);

    render(<LoginScreen />);

    fireEvent.changeText(screen.getByPlaceholderText('Seu login'), 'joaosilva');
    fireEvent.changeText(screen.getByPlaceholderText('Sua senha'), 'senha-errada');
    fireEvent.press(screen.getByText('Entrar'));

    await waitFor(() => {
      expect(screen.getByText('Login ou senha inválidos')).toBeTruthy();
    });
  });

  it('navega para /(tabs) após login bem-sucedido', async () => {
    jest.mocked(authService.login).mockResolvedValue(mockAuthResult);
    jest.mocked(storage.setToken).mockResolvedValue(undefined);

    render(<LoginScreen />);

    fireEvent.changeText(screen.getByPlaceholderText('Seu login'), 'joaosilva');
    fireEvent.changeText(screen.getByPlaceholderText('Sua senha'), 'senha123');
    fireEvent.press(screen.getByText('Entrar'));

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/(tabs)');
    });
  });
});
