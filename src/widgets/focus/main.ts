import { mount } from 'svelte';
import '../../shared/theme.css';
import { applyTheme } from '../../shared/params';
import { mountEditor } from '../../shared/editor';
import Focus from './Focus.svelte';

// aplica o tema da URL e monta o widget na página
applyTheme();
mount(Focus, { target: document.getElementById('app')! });
mountEditor('focus');
