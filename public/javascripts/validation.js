// Bootstrapのフォームバリデーションを有効にするためのスクリプト
(() => {
    'use strict' // 厳格モードを有効にし、コードの品質を高める

    // 'needs-validation'クラスを持つすべてのフォームを取得する
    const forms = document.querySelectorAll('.needs-validation')

    // 取得した各フォームに対して処理を行う
    Array.from(forms).forEach(form => {
        // 'submit'イベント（フォーム送信時）を監視する
        form.addEventListener('submit', event => {
            // form.checkValidity()でHTMLのバリデーションルール（例: required）をチェック
            // もしルール違反があれば、if文の中が実行される
            if (!form.checkValidity()) {
                // event.preventDefault()でフォームの送信を中止する
                event.preventDefault()
                // event.stopPropagation()でイベントの伝播を停止する
                event.stopPropagation()
            }
            // フォームに'was-validated'クラスを追加する
            // これにより、Bootstrapがバリデーション結果（成功/失敗）に応じたスタイルを適用する
            form.classList.add('was-validated')
        }, false)
    })
})()
