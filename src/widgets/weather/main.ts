import { mount } from 'svelte';
import '../../shared/theme.css';
import { applyTheme } from '../../shared/params';
import Weather from './Weather.svelte';

// aplica o tema da URL e monta o widget na página
applyTheme();
mount(Weather, { target: document.getElementById('app')! });
