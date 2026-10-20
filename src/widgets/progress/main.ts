import { mount } from 'svelte';
import '../../shared/theme.css';
import { applyTheme } from '../../shared/params';
import Progress from './Progress.svelte';

// aplica o tema da URL e monta o widget na página
applyTheme();
mount(Progress, { target: document.getElementById('app')! });
