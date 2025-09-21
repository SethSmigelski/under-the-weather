import { registerBlockType } from '@wordpress/blocks';
import './editor.scss'; 
import Edit from './edit';
import save from './save';
import block from './block.json';

registerBlockType( block.name, {
	edit: Edit,
	save,
} );
