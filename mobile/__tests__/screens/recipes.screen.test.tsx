/* eslint-disable @typescript-eslint/no-require-imports */
import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import RecipesScreen from '../../app/(tabs)/index';
import { recipesService } from '../../src/modules/recipes/recipes.service';
import { authService } from '../../src/modules/auth/auth.service';
import { storage } from '../../src/shared/storage/storage';

const mockReplace = jest.fn();
const mockPush = jest.fn();

jest.mock('expo-router', () => {
  let focusCalled = false;
  return {
    __resetFocus: () => {
      focusCalled = false;
    },
    useRouter: () => ({ replace: mockReplace, push: mockPush }),
    useFocusEffect: (cb: () => void) => {
      if (!focusCalled) {
        focusCalled = true;
        setImmediate(() => {
          try { cb(); } catch (e) {}
        });
      }
    },
    useNavigation: () => ({ setOptions: jest.fn() }),
    Tabs: { Screen: ({ options }: any) => options?.headerRight ? options.headerRight() : null },
  };
});

jest.mock('../../src/modules/recipes/recipes.service', () => ({
  recipesService: {
    list: jest.fn(),
    getCategories: jest.fn(),
  },
}));

jest.mock('../../src/modules/auth/auth.service', () => ({
  authService: {
    logout: jest.fn(),
  },
}));

jest.mock('../../src/shared/storage/storage', () => ({
  storage: {
    removeToken: jest.fn(),
  },
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => null,
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

jest.mock('../../src/components/ui/AppButton', () => {
  const React = require('react');
  const { TouchableOpacity, Text } = require('react-native');
  return {
    AppButton: ({ title, onPress, loading }: any) =>
      React.createElement(TouchableOpacity, { onPress, disabled: loading }, React.createElement(Text, null, loading ? 'Carregando...' : title)),
  };
});

const mockCategory = { id: '1', name: 'Almoço' };
const mockRecipe = {
  id: '1',
  name: 'Bolo de cenoura',
  prepTimeMinutes: 60,
  servings: 8,
  prepMethod: 'Misture tudo e asse.',
  ingredients: '2 cenouras, 3 ovos',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  category: mockCategory,
  user: { id: '1', name: 'João Silva', login: 'joaosilva' },
};

const emptyPaginated = {
  recipes: [],
  pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
};

const filledPaginated = {
  recipes: [mockRecipe],
  pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
};

describe('RecipesScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    try {
      const routerMock = require('expo-router');
      if (routerMock && typeof routerMock.__resetFocus === 'function') routerMock.__resetFocus();
    } catch (e) {
      // ignore
    }
    jest.mocked(recipesService.getCategories).mockResolvedValue([mockCategory]);
  });

  it('exibe estado vazio quando não há receitas', async () => {
    jest.mocked(recipesService.list).mockResolvedValue(emptyPaginated);

    render(<RecipesScreen />);

    await waitFor(() => {
      expect(screen.getByText('Nenhuma receita ainda')).toBeTruthy();
    });
  });

  it('exibe as receitas carregadas com nome e metadados', async () => {
    jest.mocked(recipesService.list).mockResolvedValue(filledPaginated);

    render(<RecipesScreen />);

    await waitFor(() => {
      expect(screen.getByText('Bolo de cenoura')).toBeTruthy();
      expect(screen.getByText('Almoço')).toBeTruthy();
      expect(screen.getByText('⏱ 60 min')).toBeTruthy();
      expect(screen.getByText('🍽 8 porções')).toBeTruthy();
    });
  });

  it('chama recipesService.list ao montar', async () => {
    jest.mocked(recipesService.list).mockResolvedValue(emptyPaginated);

    render(<RecipesScreen />);

    await waitFor(() => {
      expect(recipesService.list).toHaveBeenCalledTimes(1);
    });
  });

  it('navega para /recipe-form ao pressionar o FAB', async () => {
    jest.mocked(recipesService.list).mockResolvedValue(emptyPaginated);

    render(<RecipesScreen />);

    await waitFor(() => screen.getByText('Nenhuma receita ainda'));

    fireEvent.press(screen.getByTestId('fab-button'));

    expect(mockPush).toHaveBeenCalledWith('/recipe-form');
  });

  it('realiza logout e redireciona para /login', async () => {
    jest.mocked(recipesService.list).mockResolvedValue(emptyPaginated);
    jest.mocked(authService.logout).mockResolvedValue(undefined);
    jest.mocked(storage.removeToken).mockResolvedValue(undefined);

    render(<RecipesScreen />);

    await waitFor(() => screen.getByText('Sair'));

    fireEvent.press(screen.getByText('Sair'));

    await waitFor(() => {
      expect(storage.removeToken).toHaveBeenCalled();
      expect(mockReplace).toHaveBeenCalledWith('/login');
    });
  });

  it('continua com logout mesmo se authService.logout falhar', async () => {
    jest.mocked(recipesService.list).mockResolvedValue(emptyPaginated);
    jest.mocked(authService.logout).mockRejectedValue(new Error('Erro de rede'));
    jest.mocked(storage.removeToken).mockResolvedValue(undefined);

    render(<RecipesScreen />);

    await waitFor(() => screen.getByText('Sair'));

    fireEvent.press(screen.getByText('Sair'));

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/login');
    });
  });

  it('busca por palavra quando o botão Buscar é pressionado', async () => {
    jest.mocked(recipesService.list).mockResolvedValue(emptyPaginated);
    const renderResult = render(<RecipesScreen />);

    await waitFor(() => renderResult.getByPlaceholderText('Buscar receitas'));
    fireEvent.changeText(renderResult.getByPlaceholderText('Buscar receitas'), 'cenoura');
    await waitFor(() => expect((renderResult.getByPlaceholderText('Buscar receitas') as any).props.value).toBe('cenoura'));
    fireEvent.press(renderResult.getByTestId('buscar-button'));

    await waitFor(() => {
      expect(recipesService.list).toHaveBeenCalled();
      const calls = jest.mocked(recipesService.list).mock.calls;
      const call = calls[calls.length - 1]!;
      expect(call[2]).toMatchObject({ q: 'cenoura' });
    });
  });

  it('aplica filtros (categoria + min/max) via modal e chama list com filtros', async () => {
    jest.mocked(recipesService.list).mockResolvedValue(emptyPaginated);
    jest.mocked(recipesService.getCategories).mockResolvedValue([mockCategory]);

    const renderResult = render(<RecipesScreen />);

    await waitFor(() => renderResult.getByTestId('filtros-button'));
    fireEvent.press(renderResult.getByTestId('filtros-button'));

    await waitFor(() => renderResult.getByText('Selecionar categoria'));
    fireEvent.press(renderResult.getByText('Selecionar categoria'));
    await waitFor(() => renderResult.getByText(mockCategory.name));
    fireEvent.press(renderResult.getByText(mockCategory.name));

    fireEvent.changeText(renderResult.getByPlaceholderText('Min'), '10');
    fireEvent.changeText(renderResult.getByPlaceholderText('Max'), '100');
    fireEvent.press(renderResult.getByText('Aplicar'));

    await waitFor(() => {
      expect(recipesService.list).toHaveBeenCalled();
      const calls = jest.mocked(recipesService.list).mock.calls;
      const call = calls[calls.length - 1]!;
      expect(call[2]).toMatchObject({ categoryId: mockCategory.id, minPrepTime: 10, maxPrepTime: 100 });
    });
  });
});
