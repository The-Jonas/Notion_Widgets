import { mount } from 'svelte';
import '../../shared/theme.css';
import { applyTheme } from '../../shared/params';
import { mountEditor } from '../../shared/editor';
import Weather from './Weather.svelte';

// aplica o tema da URL e monta o widget na página
applyTheme();
mount(Weather, { target: document.getElementById('app')! });
mountEditor('weather');
