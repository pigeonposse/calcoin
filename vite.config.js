/* eslint-disable camelcase */

import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import {
	description, homepage, 
} from './package.json'
export default defineConfig( { 
	root      : 'src',
	publicDir : '../public',
	server    : {
		port : 1312,
		fs   : { allow: [ '..' ] }, 
	},
	build   : { outDir: '../dist' },
	// optimizeDeps : { include: [ 'xlsx', 'jspdf' ] },
	plugins : [
		VitePWA( {
			registerType : 'autoUpdate',
			manifest     : { 
				theme_color : "#ff9400",
				name        : "Calcoin",
				short_name  : "Calcoin",
				description,
				homepage,
				display     : "standalone",
				icons       : [
					{
						"src"   : "pwa-64x64.png",
						"sizes" : "64x64",
						"type"  : "image/png",
					},
					{
						"src"   : "pwa-192x192.png",
						"sizes" : "192x192",
						"type"  : "image/png",
					},
					{
						"src"   : "pwa-512x512.png",
						"sizes" : "512x512",
						"type"  : "image/png",
					},
					{
						"src"     : "maskable-icon-512x512.png",
						"sizes"   : "512x512",
						"type"    : "image/png",
						"purpose" : "maskable",
					},
				], 
			}, 
		} ), 
	], 
} )
