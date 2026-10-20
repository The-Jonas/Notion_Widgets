import { mount } from 'svelte';
import '../shared/theme.css';
import Workbench from './Workbench.svelte';

// a Workbench sempre usa o tema escuro com fundo de página do Notion
document.documentElement.dataset.theme = 'dark';
document.documentElement.dataset.bg = 'page';
mount(Workbench, { target: document.getElementById('app')! });
