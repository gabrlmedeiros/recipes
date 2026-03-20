import 'react-native-gesture-handler/jestSetup';

try {
	jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');
} catch (e) {
	// Ignore if the native helper is not available in this environment
}

try {
	const _orig = console.error.bind(console);
	console.error = (...args: any[]) => {
		try {
			const first = args[0];
			if (typeof first === 'string' && first.includes('not wrapped in act(')) {
				return;
			}
		} catch (e) {
            console.error('Error in custom console.error override:', e);
        }
		_orig(...args);
	};
} catch (e) {
	// Ignore errors while installing console override
}

export {};
