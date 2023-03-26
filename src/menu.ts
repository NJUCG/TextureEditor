import { app } from "electron";

const { BrowserWindow, Menu } = require("electron");


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

	ExportPng = "export_png",
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
					click: () => {
						BrowserWindow.getFocusedWindow().webContents.send(MenuCommands.FileNew);
					}
				},
				{
					label: "打开文件",
					accelerator: "CmdOrCtrl+O",
					click: () => {
						BrowserWindow.getFocusedWindow().webContents.send(MenuCommands.FileOpen);
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
					click: () => {
						BrowserWindow.getFocusedWindow().webContents.send(MenuCommands.FileSave);
					}
				},
				{
					label: "另存为",
					accelerator: "CmdOrCtrl+Shift+S",
					click: () => {
						BrowserWindow.getFocusedWindow().webContents.send(MenuCommands.FileSaveAs);
					}
				},
                {
                    type: 'separator'
                },
				{
					label: "导出纹理",
					submenu: [
						{
							label: "导出为图片(.PNG)",
							click: () => {
								BrowserWindow.getFocusedWindow().webContents.send(MenuCommands.ExportPng);
							}
						},
					]
				},
                {
                    type: 'separator'
                },
				{
					label: "退出",
					click: () => {
						if (process.platform !== "darwin") {
							app.quit();
						}
					}
				}
			]
		},
		{
			label: '编辑',
			submenu: [
				{
					label: '撤销',
					accelerator: "CmdOrCtrl+Z",
					click: () => {
						BrowserWindow.getFocusedWindow().webContents.send(MenuCommands.EditUndo);
					}
				},
				{
					label: '重做',
					accelerator: "CmdOrCtrl+Shift+Z",
					click: () => {
						BrowserWindow.getFocusedWindow().webContents.send(MenuCommands.EditRedo);
					}
				},
				{
					label: "剪切",
					accelerator: "CmdOrCtrl+X",
					click: () => {
						BrowserWindow.getFocusedWindow().webContents.send(MenuCommands.EditCut);
					}
				},
				{
					label: "复制",
					accelerator: "CmdOrCtrl+C",
					click: () => {
						BrowserWindow.getFocusedWindow().webContents.send(MenuCommands.EditCopy);
					}
				},
				{
					label: "粘贴",
					accelerator: "CmdOrCtrl+V",
					click: () => {
						BrowserWindow.getFocusedWindow().webContents.send(MenuCommands.EditPaste);
					}
				}
			]
		},
		{
			label: '工具',
			submenu: [
				{label: '没想好'},
				{label: '没想好'}
			]
		},
		{
			label: '窗口',
			submenu: [
				{label: '浏览窗口'},
				{label: '2D 视图'},
				{label: '3D 视图'},
				{label: '资源库'},
				{label: '属性栏'},
				{label: '结点图'},
			]
		},
		{
			label: '帮助',
			submenu: [
				{label: '没想好'},
				{label: '没想好'}
			]
		}
    ];



    const menu = Menu.buildFromTemplate(template as any);
	Menu.setApplicationMenu(menu);
}