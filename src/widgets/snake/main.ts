import { mount } from 'svelte';
import '../../shared/theme.css';
import { applyTheme } from '../../shared/params';
import Snake from './Snake.svelte';

// aplica o tema da URL e monta o widget na página
applyTheme();
mount(Snake, { target: document.getElementById('app')! });
