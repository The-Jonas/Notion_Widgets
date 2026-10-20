import { mount } from 'svelte';
import '../../shared/theme.css';
import { applyTheme } from '../../shared/params';
import { mountEditor } from '../../shared/editor';
import Timer from './Timer.svelte';

// aplica o tema da URL e monta o widget na página
applyTheme();
mount(Timer, { target: document.getElementById('app')! });
mountEditor('timer');
