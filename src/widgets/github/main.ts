import { mount } from 'svelte';
import '../../shared/theme.css';
import { applyTheme } from '../../shared/params';
import { mountEditor } from '../../shared/editor';
import GitHub from './GitHub.svelte';

// aplica o tema da URL e monta o widget na página
applyTheme();
mount(GitHub, { target: document.getElementById('app')! });
mountEditor('github');
