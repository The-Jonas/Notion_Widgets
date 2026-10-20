import { mount } from 'svelte';
import '../../shared/theme.css';
import { applyTheme } from '../../shared/params';
import Clock from './Clock.svelte';

// aplica o tema da URL e monta o widget na página
applyTheme();
mount(Clock, { target: document.getElementById('app')! });
