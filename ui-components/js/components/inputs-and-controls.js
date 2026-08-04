/* ==========================================================================
   Component Artboard 2: Inputs & Controls
   ========================================================================== */

(function(window) {
  window.ComponentModules = window.ComponentModules || {};

  window.ComponentModules['inputs-and-controls'] = {
    id: 'inputs-and-controls',
    title: 'inputs-and-controls (입력과 선택 컨트롤)',
    tag: 'Forms & Controls',
    desc: '사용자가 조작하고 정밀한 입력값을 전달하는 입력 폼 및 선택 컨트롤 모음',
    groups: [
      {
        title: 'Text & Value Inputs (텍스트 및 수치 입력 계층)',
        desc: '사용자로부터 직접적인 텍스트, 수치, 파일, 날짜 데이터를 입력받는 컨트롤 모음입니다.',
        components: [
          {
            id: 'text-input',
            title: 'Text Input (단문 입력창)',
            desc: '이메일, 이름, 제목 등 1줄 단문 텍스트 데이터를 수집하는 기본 폼',
            render: function() {
              return `
                <div class="ui-form-group" style="width:100%; max-width:280px;">
                  <label class="ui-label">사용자 이메일</label>
                  <input type="email" class="ui-input" placeholder="name@company.com" />
                </div>
              `;
            },
            code: `<input type="text" class="ui-input" placeholder="입력" />`
          },
          {
            id: 'textarea',
            title: 'Textarea (장문 텍스트 영역)',
            desc: '피드백, 문의 내용 등 여러 줄의 개행 텍스트 데이터를 수집하는 폼',
            render: function() {
              return `
                <div class="ui-form-group" style="width:100%; max-width:280px;">
                  <label class="ui-label">상세 피드백 작성</label>
                  <textarea class="ui-textarea" placeholder="내용을 작성해 주세요..."></textarea>
                </div>
              `;
            },
            code: `<textarea class="ui-textarea" placeholder="내용 작성"></textarea>`
          },
          {
            id: 'stepper',
            title: 'Stepper (수량 조절)',
            desc: '+, - 버튼으로 숫자를 증감하는 수치 조절기',
            render: function() {
              return `
                <div class="ui-stepper">
                  <button class="ui-stepper-btn" onclick="
                    const val = this.nextElementSibling;
                    let num = parseInt(val.textContent);
                    if(num > 1) val.textContent = --num;
                  ">-</button>
                  <span class="ui-stepper-value">1</span>
                  <button class="ui-stepper-btn" onclick="
                    const val = this.previousElementSibling;
                    let num = parseInt(val.textContent);
                    val.textContent = ++num;
                  ">+</button>
                </div>
              `;
            },
            code: `<div class="ui-stepper">\n  <button>-</button>\n  <span>1</span>\n  <button>+</button>\n</div>`
          },
          {
            id: 'slider-range',
            title: 'Slider / Range',
            desc: '연속적인 수치 범위를 드래그하여 지정하는 슬라이더',
            render: function() {
              return `
                <div class="ui-form-group" style="width:100%; max-width:260px;">
                  <div style="display:flex; justify-content:space-between; font-size:12px; color:#aaa;">
                    <span>불투명도 (Opacity)</span>
                    <span id="range-val">80%</span>
                  </div>
                  <input type="range" min="0" max="100" value="80" style="width:100%; accent-color:#6366f1;" oninput="document.getElementById('range-val').textContent = this.value + '%'" />
                </div>
              `;
            },
            code: `<input type="range" min="0" max="100" value="80" class="ui-slider" />`
          },
          {
            id: 'date-picker',
            title: 'Date / Time Picker',
            desc: '날짜 및 시각 데이터를 지정하는 캘린더 피커 (클릭 시 캘린더 피커 열림)',
            render: function() {
              return `
                <div class="ui-form-group" style="width:100%; max-width:280px;">
                  <label class="ui-label">배포 예약 일시</label>
                  <div style="position:relative; width:100%;">
                    <input type="datetime-local" id="demo-datetime-picker" class="ui-input" value="2026-08-04T12:00" style="padding-right:36px; cursor:pointer; color-scheme:dark;" onchange="if(window.handleDateTimeChange) window.handleDateTimeChange(this)" onclick="try{this.showPicker();}catch(e){}" />
                    <span style="position:absolute; right:10px; top:50%; transform:translateY(-50%); pointer-events:none; font-size:14px;">📅</span>
                  </div>
                  <div id="datetime-status-text" style="font-size:11px; color:#818cf8; margin-top:4px; font-weight:600;">선택 일시: 2026-08-04 12:00</div>
                </div>
              `;
            },
            code: `<input type="datetime-local" class="ui-input" value="2026-08-04T12:00" />`
          },
          {
            id: 'file-uploader',
            title: 'File Uploader',
            desc: '클릭하거나 드래그 앤 드롭하여 파일 탐색기 열기 및 업로드 상태 확인',
            render: function() {
              return `
                <div id="file-uploader-box" style="border:2px dashed rgba(255,255,255,0.25); border-radius:10px; padding:20px; text-align:center; cursor:pointer; width:100%; max-width:320px; transition:all 0.2s ease; background:rgba(255,255,255,0.02);" 
                  ondragover="event.preventDefault(); this.style.borderColor='#6366f1'; this.style.background='rgba(99,102,241,0.1)';" 
                  ondragleave="this.style.borderColor='rgba(255,255,255,0.25)'; this.style.background='rgba(255,255,255,0.02)';"
                  ondrop="if(window.handleFileDrop) window.handleFileDrop(event);"
                  onclick="const input=document.getElementById('demo-file-input'); if(input) input.click();">
                  
                  <input type="file" id="demo-file-input" style="display:none;" onchange="if(window.handleFileSelect) window.handleFileSelect(this);" />
                  
                  <div id="file-uploader-idle-state">
                    <div style="font-size:28px; margin-bottom:6px;">☁️</div>
                    <div style="font-size:13px; font-weight:600; color:#e5e7eb;">클릭하여 파일 탐색기 열기 또는 드롭</div>
                    <div style="font-size:11px; color:#9ca3af; margin-top:4px;">모든 파일 지원 (드래그 앤 드롭 가능)</div>
                  </div>

                  <div id="file-uploader-active-state" style="display:none; text-align:left;">
                    <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;">
                      <div style="display:flex; align-items:center; gap:8px; overflow:hidden;">
                        <span style="font-size:18px;">📄</span>
                        <div style="overflow:hidden;">
                          <div id="uploaded-filename" style="font-size:12px; font-weight:600; color:#fff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:180px;">filename.png</div>
                          <div id="uploaded-filesize" style="font-size:10px; color:#9ca3af;">1.2 MB</div>
                        </div>
                      </div>
                      <button type="button" style="background:rgba(239,68,68,0.2); border:1px solid rgba(239,68,68,0.4); color:#fca5a5; padding:3px 8px; border-radius:4px; cursor:pointer; font-size:11px; font-weight:bold;" onclick="event.stopPropagation(); if(window.resetDemoFileUploader) window.resetDemoFileUploader();">✕ 삭제</button>
                    </div>
                    <div style="width:100%; height:4px; background:rgba(255,255,255,0.1); border-radius:2px; overflow:hidden; margin-top:6px;">
                      <div style="width:100%; height:100%; background:#10b981; border-radius:2px;"></div>
                    </div>
                    <div style="font-size:10px; color:#10b981; margin-top:4px; font-weight:600;">✓ 업로드 완료</div>
                  </div>
                </div>
              `;
            },
            code: `<div class="ui-file-uploader" onclick="document.getElementById('file-input').click()">
  <input type="file" id="file-input" hidden />
  <span>클릭하여 파일 선택 또는 드롭</span>
</div>`
          }
        ]
      },
      {
        title: 'Selection & Toggle Controls (선택 및 토글 계층)',
        desc: '주어진 선택지 중 하나 또는 여러 개를 고르거나 상태를 전환하는 컨트롤 모음입니다.',
        components: [
          {
            id: 'checkbox',
            title: 'Checkbox (체크박스)',
            desc: '독립적인 선택지 0개 이상을 동시 선택할 수 있는 다중 선택(Check) 옵션',
            render: function() {
              return `
                <div style="display:flex; flex-direction:column; gap:8px;">
                  <label class="ui-checkbox-label">
                    <input type="checkbox" class="ui-checkbox" checked />
                    <span>이메일 수신 동의 (Checkbox)</span>
                  </label>
                  <label class="ui-checkbox-label">
                    <input type="checkbox" class="ui-checkbox" />
                    <span>마케팅 정보 동의</span>
                  </label>
                </div>
              `;
            },
            code: `<input type="checkbox" class="ui-checkbox" />`
          },
          {
            id: 'radio',
            title: 'Radio (라디오 버튼)',
            desc: '동일 그룹 항목 중 오직 하나만 고를 수 있는 배타적 단일 선택(Radio) 옵션',
            render: function() {
              return `
                <div style="display:flex; gap:16px;">
                  <label class="ui-radio-label">
                    <input type="radio" name="user-role" class="ui-radio" checked />
                    <span>개발자 (Radio)</span>
                  </label>
                  <label class="ui-radio-label">
                    <input type="radio" name="user-role" class="ui-radio" />
                    <span>디자이너</span>
                  </label>
                </div>
              `;
            },
            code: `<input type="radio" name="group" class="ui-radio" />`
          },
          {
            id: 'dropdown-select',
            title: 'Dropdown / Select',
            desc: '목록 메뉴에서 단일 옵션을 고르는 셀렉트 박스',
            render: function() {
              return `
                <div class="ui-form-group" style="width:100%; max-width:260px;">
                  <label class="ui-label">권한 등급 선택</label>
                  <select class="ui-select">
                    <option>👑 Administrator (관리자)</option>
                    <option selected>⚡ Editor (편집자)</option>
                    <option>👁️ Viewer (열람자)</option>
                  </select>
                </div>
              `;
            },
            code: `<select class="ui-select">\n  <option>Option 1</option>\n</select>`
          },
          {
            id: 'toggle-switch',
            title: 'Toggle Switch',
            desc: 'On/Off 상태를 직관적으로 전환하는 스위치',
            render: function() {
              return `
                <div style="display:flex; align-items:center; gap:12px;">
                  <label class="ui-toggle">
                    <input type="checkbox" checked onchange="showToast('다크모드 설정이 ' + (this.checked?'켜짐':'꺼짐'))" />
                    <span class="ui-toggle-slider"></span>
                  </label>
                  <span style="font-size:13px; color:#e5e7eb;">다크모드 활성화</span>
                </div>
              `;
            },
            code: `<label class="ui-toggle">\n  <input type="checkbox" />\n  <span class="ui-toggle-slider"></span>\n</label>`
          },
          {
            id: 'segmented-control',
            title: 'Segmented Control',
            desc: '서로 상목적인 보기 옵션을 탭처럼 빠르게 전환',
            render: function() {
              return `
                <div style="background:rgba(0,0,0,0.4); padding:4px; border-radius:8px; border:1px solid rgba(255,255,255,0.1); display:inline-flex; gap:4px;">
                  <button class="ui-btn ui-btn-primary" style="padding:6px 12px; font-size:12px;" onclick="
                    this.parentNode.querySelectorAll('button').forEach(b=>b.className='ui-btn ui-btn-secondary');
                    this.className='ui-btn ui-btn-primary';
                  ">월간 (Monthly)</button>
                  <button class="ui-btn ui-btn-secondary" style="padding:6px 12px; font-size:12px;" onclick="
                    this.parentNode.querySelectorAll('button').forEach(b=>b.className='ui-btn ui-btn-secondary');
                    this.className='ui-btn ui-btn-primary';
                  ">연간 (Yearly)</button>
                </div>
              `;
            },
            code: `<div class="ui-segmented-control">\n  <button class="active">Monthly</button>\n  <button>Yearly</button>\n</div>`
          },
          {
            id: 'chip-tag',
            title: 'Chip / Tag',
            desc: '선택된 필터나 카테고리를 콤팩트 태그 형태로 표시',
            render: function() {
              return `
                <div style="display:flex; gap:8px; flex-wrap:wrap;">
                  <span class="ui-chip"><span>React.js</span><span class="ui-chip-remove" onclick="this.parentNode.remove()">✕</span></span>
                  <span class="ui-chip"><span>TypeScript</span><span class="ui-chip-remove" onclick="this.parentNode.remove()">✕</span></span>
                  <span class="ui-chip"><span>Figma Canvas</span><span class="ui-chip-remove" onclick="this.parentNode.remove()">✕</span></span>
                </div>
              `;
            },
            code: `<span class="ui-chip">React.js <span class="remove">✕</span></span>`
          },
          {
            id: 'accordion',
            title: 'Accordion',
            desc: '제목 클릭 시 내용 영역을 펴고 접는 영역',
            render: function() {
              return `
                <div style="width:100%; max-width:300px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:8px; overflow:hidden;">
                  <div style="padding:12px; font-size:13px; font-weight:600; cursor:pointer; display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.04);" onclick="
                    const b = this.nextElementSibling;
                    b.style.display = b.style.display==='none'?'block':'none';
                  ">
                    <span>📌 서비스 아키텍처 상세 보기</span>
                    <span>▼</span>
                  </div>
                  <div style="padding:12px; font-size:12px; color:#aaa; display:none; border-top:1px solid rgba(255,255,255,0.08);">
                    아코디언 내부에는 상세 텍스트 및 관련 설정폼이 동적으로 렌더링됩니다.
                  </div>
                </div>
              `;
            },
            code: `<div class="ui-accordion">\n  <div class="ui-accordion-header">Title</div>\n  <div class="ui-accordion-body">Content</div>\n</div>`
          }
        ]
      }
    ]
  };

  // Global Handlers for Date/Time Picker & File Uploader
  window.handleDateTimeChange = function(inputEl) {
    const val = inputEl.value;
    const statusEl = document.getElementById('datetime-status-text');
    if (statusEl) {
      statusEl.textContent = `선택 일시: ${val.replace('T', ' ')}`;
    }
    if (window.showToast) {
      window.showToast(`일시 설정 완료: ${val.replace('T', ' ')}`);
    }
  };

  window.handleFileSelect = function(inputEl) {
    if (inputEl.files && inputEl.files[0]) {
      window.renderUploadedFileState(inputEl.files[0]);
    }
  };

  window.handleFileDrop = function(event) {
    event.preventDefault();
    const box = document.getElementById('file-uploader-box');
    if (box) {
      box.style.borderColor = 'rgba(255,255,255,0.25)';
      box.style.background = 'rgba(255,255,255,0.02)';
    }
    if (event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
      window.renderUploadedFileState(event.dataTransfer.files[0]);
    }
  };

  window.renderUploadedFileState = function(file) {
    const idleState = document.getElementById('file-uploader-idle-state');
    const activeState = document.getElementById('file-uploader-active-state');
    const filenameEl = document.getElementById('uploaded-filename');
    const filesizeEl = document.getElementById('uploaded-filesize');

    if (idleState) idleState.style.display = 'none';
    if (activeState) activeState.style.display = 'block';

    if (filenameEl) filenameEl.textContent = file.name;
    if (filesizeEl) {
      const sizeKB = (file.size / 1024).toFixed(1);
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      filesizeEl.textContent = file.size > 1024 * 1024 ? `${sizeMB} MB` : `${sizeKB} KB`;
    }

    if (window.showToast) {
      window.showToast(`파일 준비 완료: ${file.name}`);
    }
  };

  window.resetDemoFileUploader = function() {
    const idleState = document.getElementById('file-uploader-idle-state');
    const activeState = document.getElementById('file-uploader-active-state');
    const inputEl = document.getElementById('demo-file-input');

    if (inputEl) inputEl.value = '';
    if (idleState) idleState.style.display = 'block';
    if (activeState) activeState.style.display = 'none';

    if (window.showToast) {
      window.showToast('업로드 파일이 삭제되었습니다.');
    }
  };
})(window);
