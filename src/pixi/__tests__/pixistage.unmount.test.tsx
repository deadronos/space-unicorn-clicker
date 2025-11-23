import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import React from 'react';
import PixiStage from '../PixiStage';
import * as PIXI from 'pixi.js';

// Mock PIXI
vi.mock('pixi.js', () => {
    const destroyMock = vi.fn();
    const resizeMock = vi.fn();
    const tickerAddMock = vi.fn();
    const tickerRemoveMock = vi.fn();
    
    // Mock classes need to be constructible functions
    class Application {
        init = vi.fn().mockResolvedValue(undefined);
        destroy = destroyMock;
        renderer = { resize: resizeMock };
        ticker = { add: tickerAddMock, remove: tickerRemoveMock };
        stage = { addChild: vi.fn(), removeChild: vi.fn() };
        screen = { width: 800, height: 600 };
        canvas = document.createElement('canvas');
        view = document.createElement('canvas');
    }

    class Container {
        addChild = vi.fn();
        removeChild = vi.fn();
        destroy = vi.fn();
        zIndex = 0;
    }

    class Graphics {
        clear = vi.fn();
        beginFill = vi.fn();
        drawRect = vi.fn();
        endFill = vi.fn();
        destroy = vi.fn();
        circle = vi.fn();
        fill = vi.fn();
    }

    return {
        Application: Application,
        Container: Container,
        Graphics: Graphics,
        Point: vi.fn(),
        Texture: { from: vi.fn() },
        Assets: { load: vi.fn().mockResolvedValue({}) },
    };
});

// Mock usePixiApp to return our mocked app immediately
vi.mock('../usePixiApp', () => ({
    createPixiApp: vi.fn().mockImplementation(async () => {
        // Create a plain object that looks like an app, instead of trying to new the mock
        const destroyMock = vi.fn();
        const resizeMock = vi.fn();
        const tickerAddMock = vi.fn();
        const tickerRemoveMock = vi.fn();
        
        return {
            init: vi.fn().mockResolvedValue(undefined),
            destroy: destroyMock,
            renderer: { resize: resizeMock },
            ticker: { add: tickerAddMock, remove: tickerRemoveMock },
            stage: { addChild: vi.fn(), removeChild: vi.fn() },
            screen: { width: 800, height: 600 },
            canvas: document.createElement('canvas'),
            view: document.createElement('canvas'),
        };
    })
}));

describe('PixiStage', () => {
    let container: HTMLDivElement;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
        vi.useFakeTimers();
    });

    afterEach(() => {
        document.body.removeChild(container);
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    it('should clean up app and listeners on unmount', async () => {
        const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
        
        const root = createRoot(container);
        
        // Render
        await act(async () => {
            root.render(<PixiStage />);
        });

        // Wait for async effect
        await act(async () => {
            await Promise.resolve(); // Flush promises
        });

        // Unmount
        await act(async () => {
            root.unmount();
        });

        // Assert cleanup
        expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    });
});
