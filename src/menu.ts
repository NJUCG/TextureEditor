const { Menu } = require("electron");


export enum MenuCommands {
	FileNew = "file_new",
	FileOpen = "file_open",
	FileOpenRecent = "file_open_recent",
	FileSave = "file_save",
	FileSaveAs = "file_saveas",
	FileExit = "file_exit",

	EditUndo = "edit_undo",
	EditRedo = "edit_redo",
	EditCut = "edit_cut",
	EditCopy = "edit_copy",
	EditPaste = "edit_paste",

	ExportZip = "export_zip",
	ExportUnity = "export_unity",
	ExportUnityZip = "export_unity_zip",

	ExamplesGoldLinesMarbleTiles = "samples_1",
	ExamplesGrenade = "samples_2",
	ExamplesScrews = "samples_3",
	ExamplesWoodenPlanks = "samples_4",
	StoneGrass = "samples_5",
	Copper = "samples_6",
	FoilGasket = "samples_7",
	StylizedGrass = "samples_8",
	Sand = "samples_9",
	YellowTiles = "samples_10",

	HelpTutorials = "help_tutorials",
	HelpAbout = "help_about",
	HelpSubmitBug = "help_submitbug",
	HelpDocumentation = "help_docs"
}

export function setupMenu(){

    const template = [
        {
            label: "文件",
            submenu: [
				{
					label: "新建文件",
					accelerator: "CmdOrCtrl+N",
					click: (item, focusedWindow) => {
						focusedWindow.webContents.send(MenuCommands.FileNew);
					}
				},
				{
					label: "打开文件",
					accelerator: "CmdOrCtrl+O",
					click: (item, focusedWindow) => {
						focusedWindow.webContents.send(MenuCommands.FileOpen);
					}
				},
				// {
				// 	label: "最近文件",
				// 	submenu: recentFilesMenu
				// },
                {
                    type: 'separator'
                },
				{
					label: "保存",
					accelerator: "CmdOrCtrl+S",
					click: (item, focusedWindow) => {
						focusedWindow.webContents.send(MenuCommands.FileSave);
					}
				},
				{
					label: "另存为",
					accelerator: "CmdOrCtrl+Shift+S",
					click: (item, focusedWindow) => {
						focusedWindow.webContents.send(MenuCommands.FileSaveAs);
					}
				},
                {
                    type: 'separator'
                },
				{
					label: "退出",
					click: (item, focusedWindow) => {
						focusedWindow.webContents.send(MenuCommands.FileExit);
					}
				}
			]
		},
    ]



    const menu = Menu.buildFromTemplate(template as any);
	Menu.setApplicationMenu(menu);
}