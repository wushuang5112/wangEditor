/**
 * @description base button class
 * @author wangfupeng
 */

import { IButtonMenu, IDropPanelMenu, IModalMenu } from '../interface'
import $, { Dom7Array } from '../../utils/dom'
import { IBarItem, getEditorInstance } from './index'
import { clearSvgStyle } from '../helpers/helpers'
import { hideAllPanelsAndModals } from '../panel-and-modal/index'
import { promiseResolveThen } from '../../utils/util'

abstract class BaseButton implements IBarItem {
  $elem: Dom7Array = $(`<div class="w-e-bar-item"></div>`)
  protected $button: Dom7Array
  menu: IButtonMenu | IDropPanelMenu | IModalMenu
  private disabled = false

  constructor(menu: IButtonMenu | IDropPanelMenu | IModalMenu) {
    // 验证 tag
    const { tag, width } = menu
    if (tag !== 'button') throw new Error(`Invalid tag '${tag}', expected 'button'`)

    // 初始化 dom
    const { title, hotkey, iconSvg } = menu
    const $svg = $(iconSvg)
    clearSvgStyle($svg) // 清理 svg 样式（扩展的菜单，svg 是不可控的，所以要清理一下）
    const tooltip = hotkey ? `${title}\n${hotkey}` : title
    const $button = $(`<button tooltip="${tooltip}"></button>`)
    $button.append($svg)
    $button.append($(`<span class="w-e-bar-item-title">${title}</span>`)) // menu title
    if (width) {
      $button.css('width', `${width}px`)
    }
    this.$elem.append($button)

    this.$button = $button
    this.menu = menu

    // 异步绑定事件
    promiseResolveThen(() => this.init())
  }

  private init() {
    // 设置 button 属性
    this.setActive()
    this.setDisabled()

    // click
    this.$button.on('click', e => {
      e.stopPropagation() // 阻止冒泡，避免隐藏 panel 和 modal

      hideAllPanelsAndModals() // 隐藏当前的各种 panel

      if (this.disabled) return

      this.exec() // 执行 menu.exec
      this.onClick() // 执行其他的逻辑
    })
  }

  /**
   * 执行 menu.exec
   */
  private exec() {
    const editor = getEditorInstance(this)
    const menu = this.menu
    const value = menu.getValue(editor)
    menu.exec(editor, value)
  }

  // 交给子类去扩展
  abstract onClick(): void

  private setActive() {
    const editor = getEditorInstance(this)
    const $button = this.$button
    const active = this.menu.isActive(editor)

    const className = 'active'
    if (active) {
      // 设置为 active
      $button.addClass(className)
    } else {
      // 取消 active
      $button.removeClass(className)
    }
  }

  private setDisabled() {
    const editor = getEditorInstance(this)
    const $button = this.$button
    const disabled = this.menu.isDisabled(editor)

    const className = 'disabled'
    if (disabled) {
      // 设置为 disabled
      $button.addClass(className)
    } else {
      // 取消 disabled
      $button.removeClass(className)
    }

    this.disabled = disabled // 记录下来
  }

  onSelectionChange() {
    this.setActive()
    this.setDisabled()
  }
}

export default BaseButton
