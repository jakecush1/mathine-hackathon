declare interface Menu {
	name: string
	links?: Link[]
	linkInt?: string
	linkExt?: string
	auth?: boolean
	secure?: boolean
	roles?: string[]
}