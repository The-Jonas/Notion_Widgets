import { mount } from 'svelte';
import '../../shared/theme.css';
import { applyTheme } from '../../shared/params';
import { mountEditor } from '../../shared/editor';
import Typing from './Typing.svelte';

// aplica o tema da URL e monta o widget na página
applyTheme();
mount(Typing, { target: document.getElementById('app')! });
mountEditor('typing');
