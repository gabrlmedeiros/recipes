/* eslint-disable @typescript-eslint/no-require-imports */
import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { recipesService } from '../../src/modules/recipes/recipes.service';
import RecipeFormScreen from '../../app/(recipes)/recipe-form';

const mockBack = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ back: mockBack }),
  useFocusEffect: (cb: () => void) => {
    const { act } = require('react-test-renderer');
    try {
      act(() => { cb(); });
    } catch (e) {
      console.error(e);
    }
  },
  useLocalSearchParams: () => ({}),
  useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn(), setOptions: jest.fn() }),
}));

jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  const Dummy = (props: any) => React.createElement(Text, null, props.name || 'icon');
  return {
    MaterialIcons: Dummy,
    Ionicons: Dummy,
    FontAwesome: Dummy,
    default: Dummy,
  };
});

jest.mock('../../src/modules/recipes/recipes.service', () => ({
  recipesService: {
    getCategories: jest.fn(),
    create: jest.fn(),
    get: jest.fn(),
    update: jest.fn(),
  },
}));

jest.mock('../../src/components/ui/AppButton', () => {
  const React = require('react');
  const { TouchableOpacity, Text, ActivityIndicator } = require('react-native');
  return {
    AppButton: ({ title, onPress, loading }: any) =>
      React.createElement(
        TouchableOpacity,
        { onPress, disabled: loading },
        loading ? React.createElement(ActivityIndicator) : React.createElement(Text, null, title),
      ),
  };
});

jest.mock('../../src/components/ui/AppInput', () => {
  const React = require('react');
  const { View, Text, TextInput } = require('react-native');
  return {
    AppInput: ({ label, value, onChangeText, placeholder, ...rest }: any) =>
      React.createElement(
        View,
        null,
        !!label && React.createElement(Text, null, label),
        React.createElement(TextInput, { value: value, onChangeText: onChangeText, placeholder: placeholder, ...rest }),
      ),
  };
});

jest.mock('../../src/constants/theme', () => ({
  Colors: {
    bgPage: '#fff',
    bgSurface: '#fff',
    bgInput: '#f5f5f5',
    bgElevated: '#eee',
    primary: '#000',
    primaryForeground: '#fff',
    textPrimary: '#000',
    textSecondary: '#444',
    textTertiary: '#888',
    borderPrimary: '#ddd',
    destructive: '#e00',
  },
  Fonts: {
    regular: 'System',
    semiBold: 'System',
    bold: 'System',
  },
}));

jest.mock('../../src/hooks/use-theme', () => ({
  useTheme: () => ({
    isDark: false,
    toggleTheme: jest.fn(),
    colors: {
      primary: '#000',
      primaryForeground: '#fff',
      bgPage: '#fff',
      bgSurface: '#fff',
      bgElevated: '#eee',
      textPrimary: '#000',
      textSecondary: '#444',
      textTertiary: '#888',
      borderPrimary: '#ddd',
    },
  }),
}));

const mockCategories = [
  { id: '1', name: 'Almoço' },
  { id: '2', name: 'Jantar' },
];

const mockRecipe = {
  id: '11111111-1111-1111-1111-111111111111',
  name: 'Bolo de cenoura',
  prepTimeMinutes: 60,
  servings: 8,
  prepMethod: 'Misture tudo e asse.',
  ingredients: '2 cenouras, 3 ovos',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  category: { id: '1', name: 'Almoço' },
  user: { id: '1', name: 'João Silva', login: 'joaosilva' },
};

describe('RecipeFormScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(recipesService.getCategories).mockResolvedValue(mockCategories);
  });

  it('renderiza os campos do formulário', async () => {
    render(<RecipeFormScreen />);

    expect(screen.getByPlaceholderText('Ex: Bolo de cenoura')).toBeTruthy();
    expect(screen.getByPlaceholderText('Ex: 60')).toBeTruthy();
    expect(screen.getByPlaceholderText('Ex: 4')).toBeTruthy();
    expect(screen.getByPlaceholderText('Liste os ingredientes...')).toBeTruthy();
    expect(screen.getByPlaceholderText('Descreva o passo a passo...')).toBeTruthy();
  });

  it('renderiza o botão de submissão', async () => {
    render(<RecipeFormScreen />);

    await waitFor(() => {
      expect(screen.getByText('Criar receita')).toBeTruthy();
    });
  });

  it('carrega e exibe as categorias como chips', async () => {
    render(<RecipeFormScreen />);

    await waitFor(() => {
      expect(screen.getByText('Almoço')).toBeTruthy();
      expect(screen.getByText('Jantar')).toBeTruthy();
    });
    expect(recipesService.getCategories).toHaveBeenCalledTimes(1);
  });

  it('submete o formulário com os dados preenchidos', async () => {
    jest.mocked(recipesService.create).mockResolvedValue(mockRecipe);

    render(<RecipeFormScreen />);

    await waitFor(() => screen.getByText('Almoço'));

    fireEvent.changeText(screen.getByPlaceholderText('Ex: Bolo de cenoura'), 'Bolo de cenoura');
    fireEvent.press(screen.getByText('Almoço'));
    fireEvent.changeText(screen.getByPlaceholderText('Ex: 60'), '60');
    fireEvent.changeText(screen.getByPlaceholderText('Ex: 4'), '8');
    fireEvent.changeText(screen.getByPlaceholderText('Liste os ingredientes...'), '2 cenouras, 3 ovos');
    fireEvent.changeText(screen.getByPlaceholderText('Descreva o passo a passo...'), 'Misture tudo e asse.');

    fireEvent.press(screen.getByText('Criar receita'));

    await waitFor(() => {
      expect(recipesService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Bolo de cenoura',
          categoryId: '1',
          prepTimeMinutes: 60,
          servings: 8,
          ingredients: '2 cenouras, 3 ovos',
          prepMethod: 'Misture tudo e asse.',
        }),
      );
    });
  });

  it('navega de volta após criação bem-sucedida', async () => {
    jest.mocked(recipesService.create).mockResolvedValue(mockRecipe);

    render(<RecipeFormScreen />);

    await waitFor(() => screen.getByText('Criar receita'));
    fireEvent.changeText(screen.getByPlaceholderText('Ex: Bolo de cenoura'), 'Bolo de cenoura');
    fireEvent.press(screen.getByText('Almoço'));
    fireEvent.press(screen.getByText('Criar receita'));

    await waitFor(() => {
      expect(mockBack).toHaveBeenCalled();
    });
  });

  it('exibe mensagem de erro quando criação falha', async () => {
    const error = {
      response: { data: { error: { message: 'Erro ao criar receita. Tente novamente.' } } },
    };
    jest.mocked(recipesService.create).mockRejectedValue(error);

    render(<RecipeFormScreen />);

    await waitFor(() => screen.getByText('Criar receita'));
    fireEvent.changeText(screen.getByPlaceholderText('Ex: Bolo de cenoura'), 'Bolo de cenoura');
    fireEvent.press(screen.getByText('Almoço'));
    fireEvent.press(screen.getByText('Criar receita'));

    await waitFor(() => {
      expect(screen.getByText('Erro ao criar receita. Tente novamente.')).toBeTruthy();
    });
  });

  it('exibe erro genérico quando a resposta não tem mensagem', async () => {
    jest.mocked(recipesService.create).mockRejectedValue(new Error('Network error'));

    render(<RecipeFormScreen />);

    await waitFor(() => screen.getByText('Criar receita'));
    fireEvent.changeText(screen.getByPlaceholderText('Ex: Bolo de cenoura'), 'Bolo de cenoura');
    fireEvent.press(screen.getByText('Almoço'));
    fireEvent.press(screen.getByText('Criar receita'));

    await waitFor(() => {
      expect(screen.getByText('Erro ao criar receita. Tente novamente.')).toBeTruthy();
    });
  });

  it('prefill e atualiza quando em modo edição (id presente)', async () => {
    const expoRouter = require('expo-router');
    jest.spyOn(expoRouter, 'useLocalSearchParams').mockReturnValue({ id: '11111111-1111-1111-1111-111111111111' });

    jest.mocked(recipesService.get).mockResolvedValue(mockRecipe as any);
    jest.mocked(recipesService.update).mockResolvedValue(mockRecipe as any);

    render(<RecipeFormScreen />);

    await waitFor(() => screen.getByText('Salvar alterações'));

    fireEvent.press(screen.getByText('Salvar alterações'));

    await waitFor(() => {
      expect(recipesService.update).toHaveBeenCalledWith(
        '11111111-1111-1111-1111-111111111111',
        expect.objectContaining({ categoryId: '1', name: 'Bolo de cenoura' }),
      );
    });
  });
});
