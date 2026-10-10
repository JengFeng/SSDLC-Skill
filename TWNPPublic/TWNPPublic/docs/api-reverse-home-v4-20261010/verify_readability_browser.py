"""Optional pixel-layout checks using the environment's existing Playwright and Edge.

Does not install packages, contact remote sites, or take screenshots.
"""
from pathlib import Path
import json
import sys
from playwright.sync_api import sync_playwright

OUT=Path(__file__).resolve().parent
EDGE=Path('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe')
CHECK=r'''() => {
 const issues=[];
 for(const svg of document.querySelectorAll('svg')) {
  const texts=[...svg.querySelectorAll('text')];
  const view=svg.viewBox.baseVal;
  const frame=svg.parentElement;
  const frameStyle=getComputedStyle(frame);
  const availableWidth=frame.clientWidth-parseFloat(frameStyle.paddingLeft)-parseFloat(frameStyle.paddingRight);
  const percent=Number(svg.dataset.fontPercent || svg.dataset.defaultFontPercent)/100;
  const expectedWidth=availableWidth*percent;
  const actualWidth=svg.getBoundingClientRect().width;
  if(Math.abs(actualWidth-expectedWidth)>1)
   issues.push({type:'wrong-fit-width',expected:expectedWidth,actual:actualWidth});
  if(Math.abs(svg.getScreenCTM().a-actualWidth/view.width)>.001)
   issues.push({type:'wrong-responsive-scale',expected:actualWidth/view.width,actual:svg.getScreenCTM().a});
  for(const text of texts) {
   const b=text.getBBox();
   if(b.x<view.x-1 || b.x+b.width>view.x+view.width+1 || b.y<view.y-1 || b.y+b.height>view.y+view.height+1)
    issues.push({type:'outside-svg',text:text.textContent});
  }
  for(const group of svg.querySelectorAll('g[data-node]')) {
   const box=group.querySelector('rect,polygon').getBBox();
   const list=texts.filter(t=> {
    const b=t.getBBox();
    return t.closest('g[data-node]')===group || (t.parentNode===svg && b.x>=box.x && b.x<box.x+box.width && b.y>=box.y && b.y<box.y+box.height);
   }).map(t=>({text:t.textContent,b:t.getBBox()}));
   for(const v of list) {
    const b=v.b;
    if(b.x<box.x+2 || b.x+b.width>box.x+box.width-2 || b.y<box.y+2 || b.y+b.height>box.y+box.height-2)
     issues.push({type:'outside-node',node:group.dataset.node,text:v.text});
   }
   for(let i=0;i<list.length;i++) for(let j=i+1;j<list.length;j++) {
    const a=list[i].b,b=list[j].b;
    if(Math.max(a.x,b.x)<Math.min(a.x+a.width,b.x+b.width)-1 && Math.max(a.y,b.y)<Math.min(a.y+a.height,b.y+b.height)-1)
     issues.push({type:'overlap',node:group.dataset.node,a:list[i].text,b:list[j].text});
   }
  }
  for(const group of svg.querySelectorAll('g[data-label]')) {
   const mask=group.querySelector('rect').getBBox();
   const b=group.querySelector('text').getBBox();
   if(b.x<mask.x-1 || b.y<mask.y-1 || b.x+b.width>mask.x+mask.width+1 || b.y+b.height>mask.y+mask.height+1)
    issues.push({type:'outside-label-mask',text:group.textContent});
  }
 }
 for(const controls of document.querySelectorAll('[data-font-controls]')) {
  if(controls.hidden)continue;
  const svg=document.getElementById(controls.dataset.fontControls).querySelector('svg');
  const percent=svg.dataset.fontPercent;
  if(controls.querySelector('input').value!==percent || controls.querySelector('[role="status"]').textContent!==`目前 ${percent}%`)
   issues.push({type:'controls-out-of-sync'});
  for(const button of controls.querySelectorAll('button[data-percent]')) {
   if(button.getAttribute('aria-pressed')!==String(button.dataset.percent===percent))issues.push({type:'wrong-active-button'});
  }
 }
 return issues;
}'''


def main():
    findings=[];checked=0;interaction_checks=0;fallback_checks=0
    percentages=['40','60','72.5','75','83','100','135','225','350']

    def check(page,file,width,state):
        nonlocal checked
        issues=page.evaluate(CHECK);checked+=1
        if issues:findings.append({'file':file.name,'viewport':width,'state':state,'issues':issues})

    with sync_playwright() as p:
        browser=p.chromium.launch(executable_path=str(EDGE),headless=True)
        page=browser.new_page()
        errors=[]
        page.on('pageerror',lambda error:errors.append(str(error)))
        for width in (1536,960):
            page.set_viewport_size({'width':width,'height':960})
            for file in sorted(OUT.glob('*.html')):
                page.goto(file.as_uri());page.evaluate('document.fonts.ready')
                check(page,file,width,'default')
                controls=page.locator('[data-font-controls]')
                assert controls.count()==(18 if file.name=='index.html' else 1)
                assert all(controls.nth(i).is_visible() for i in range(controls.count()))
                assert page.locator('svg').evaluate_all('(items)=>items.every(svg=>svg.dataset.fontPercent==="100")')
                assert page.locator('[data-font-controls] select').count()==0
                assert controls.first.locator('input').get_attribute('max') is None
                # Exercise fit presets and free-form percentages, including decimals
                # and values above the available viewport width.
                for percent in ('60','75','100'):
                    for i in range(controls.count()):
                        controls.nth(i).locator(f'button[data-percent="{percent}"]').click()
                        interaction_checks+=1
                    assert page.locator('svg').evaluate_all('(items)=>items.map(svg=>svg.dataset.fontPercent)')==[percent]*controls.count()
                    check(page,file,width,'button-'+percent)
                for percent in percentages:
                    for i in range(controls.count()):
                        controls.nth(i).locator('input').fill(percent)
                        controls.nth(i).get_by_role('button',name='套用',exact=True).click()
                        interaction_checks+=1
                    assert page.locator('svg').evaluate_all('(items)=>items.map(svg=>svg.dataset.fontPercent)')==[percent]*controls.count()
                    check(page,file,width,'custom-'+percent)
                if file.name=='index.html':
                    for i in range(controls.count()):controls.nth(i).locator('button[data-percent="75"]').click()
                    controls.first.locator('input').fill('88.8')
                    controls.first.locator('input').press('Enter')
                    values=page.locator('svg').evaluate_all('(items)=>items.map(svg=>svg.dataset.fontPercent)')
                    assert values==['88.8']+['75']*17,'diagram controls affect adjacent diagrams'
                    check(page,file,width,'independent-first-diagram')
                # Keyboard operation and invalid values must preserve the diagram.
                button=controls.first.locator('button[data-percent="75"]')
                button.focus();page.keyboard.press('Enter')
                assert button.get_attribute('aria-pressed')=='true'
                input_field=controls.first.locator('input')
                input_field.fill('72.5');input_field.press('Enter')
                assert input_field.input_value()=='72.5'
                check(page,file,width,'keyboard')
                svg=page.locator('svg').first
                previous_width=svg.evaluate('(svg)=>svg.style.width')
                for invalid in ('','0','-10'):
                    input_field.fill(invalid);input_field.press('Enter')
                    interaction_checks+=1
                    assert input_field.get_attribute('aria-invalid')=='true'
                    assert svg.get_attribute('data-font-percent')=='72.5'
                    assert svg.evaluate('(svg)=>svg.style.width')==previous_width
                button.click()
                assert input_field.get_attribute('aria-invalid') is None
                check(page,file,width,'invalid-input-recovery')
        assert not errors,errors
        # Static fallback remains useful with scripting disabled.
        static_context=browser.new_context(java_script_enabled=False,viewport={'width':960,'height':960})
        static_page=static_context.new_page()
        for name in ('index.html','03-process.html'):
            file=OUT/name
            static_page.goto(file.as_uri())
            assert not static_page.locator('[data-font-controls]').first.is_visible()
            assert static_page.locator('svg').first.is_visible()
            check(static_page,file,960,'no-javascript');fallback_checks+=1
        static_context.close()
        # Even a 200% diagram fits the printable width, without showing controls.
        page.goto((OUT/'index.html').as_uri())
        for input_field in page.locator('[data-font-controls] input').all():
            input_field.fill('225');input_field.press('Enter')
        page.emulate_media(media='print')
        assert not page.locator('[data-font-controls]').first.is_visible()
        assert page.locator('svg').evaluate_all('(items)=>items.every(svg=>svg.getBoundingClientRect().width <= svg.parentElement.clientWidth+1)')
        fallback_checks+=1
        browser.close()
        result={'checked_layout_states':checked,'interaction_checks':interaction_checks,'fallback_checks':fallback_checks,
            'viewports':[1536,960],'default_percentage':100,'tested_custom_percentages':percentages,
            'layout_policy':'Default width fits the available diagram frame; size controls scale from that responsive width.',
            'findings':findings}
    (OUT/'browser-readability-check.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
    print(f'Browser: {checked} layout states; {interaction_checks} interactions; {fallback_checks} fallback checks; {sum(len(f["issues"]) for f in findings)} issues.')
    for failure in findings[:20]:print(json.dumps(failure,ensure_ascii=True))
    return int(bool(findings))


if __name__=='__main__':
    sys.exit(main())
