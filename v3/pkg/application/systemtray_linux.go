﻿//go:build linux

package application

type linuxSystemTray struct {
	id    uint
	label string
	icon  []byte
	menu  *Menu

	iconPosition   int
	isTemplateIcon bool
	tray           pointer
	nativeMenu     pointer
}

func (s *linuxSystemTray) setIconPosition(position int) {
	s.iconPosition = position
}

func (s *linuxSystemTray) setMenu(menu *Menu) {
	s.menu = menu
	s.menu.impl = newMenuImpl(menu)
	menu.Update()
	systrayMenuSet(s.tray, (menu.impl).(*linuxMenu).native)
}

func (s *linuxSystemTray) positionWindow(window *WebviewWindow, offset int) error {
	panic("not implemented")
}

func (s *linuxSystemTray) getScreen() (*Screen, error) {
	panic("not implemented")
}

func (s *linuxSystemTray) bounds() (*Rect, error) {
	panic("not implemented")
}

func (s *linuxSystemTray) run() {
	InvokeSync(func() {
		label := s.label
		if label == "" {
			label = "Wails"
		}
		s.tray = systrayNew(label)

		// if s.nsStatusItem != nil {
		// 	Fatal("System tray '%d' already running", s.id)
		// }
		//		s.nsStatusItem = unsafe.Pointer(C.systemTrayNew())
		if s.label != "" {
			systraySetTitle(s.tray, s.label)
		}
		if s.icon != nil {
			s.setIcon(s.icon)
		}
		if s.menu != nil {
			//			s.menu.Update()
			s.setMenu(s.menu)
		}
	})
}

func (s *linuxSystemTray) setIcon(icon []byte) {
	s.icon = icon
	InvokeSync(func() {
		systraySetTemplateIcon(s.tray, icon)
	})
}

func (s *linuxSystemTray) setDarkModeIcon(icon []byte) {
	s.icon = icon
	InvokeSync(func() {
		systraySetTemplateIcon(s.tray, icon)
	})
}

func (s *linuxSystemTray) setTemplateIcon(icon []byte) {
	s.icon = icon
	s.isTemplateIcon = true

	globalApplication.dispatchOnMainThread(func() {
		systraySetTemplateIcon(s.tray, icon)
	})
}

func newSystemTrayImpl(s *SystemTray) systemTrayImpl {
	return &linuxSystemTray{
		id:             s.id,
		label:          s.label,
		icon:           s.icon,
		menu:           s.menu,
		iconPosition:   s.iconPosition,
		isTemplateIcon: s.isTemplateIcon,
	}
}
func (s *linuxSystemTray) openMenu() {
	if s.tray == nil {
		return
	}
}

func (s *linuxSystemTray) setLabel(label string) {
	s.label = label
	systraySetLabel(s.tray, label)
}

func (s *linuxSystemTray) destroy() {
	systrayDestroy(s.tray)
}