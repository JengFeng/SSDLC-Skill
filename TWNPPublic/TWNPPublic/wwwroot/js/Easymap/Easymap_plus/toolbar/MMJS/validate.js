
if (window.MM) {
    MM = window.MM;
} else {
    window.MM = {};
}

(function (MM) {

    MM.validate = {};

    MM.validate.email = function (email) {

        var emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

        return emailPattern.test(email);
    }

    MM.validate.empty = function (id, text, target) {
        var t = document.getElementById(id);
        var n = t.tagName;

        switch (n.toUpperCase()) {
            case "TEXTAREA":
            case "INPUT":

                if (t.value === "") {

                    if (target === undefined) {
                        if (t.nextElementSibling !== null && t.nextElementSibling.className === "MM_VALIDATE_EMPTY") {
                            t.parentNode.removeChild(t.nextElementSibling);
                        }
                    }

                    var span = document.createElement("SPAN");
                    span.innerText = text;
                    span.className = "MM_VALIDATE_EMPTY";
                    span.style.color = "#C02020";
                    span.style.fontFamily = "Microsoft JhengHei";

                    if (target === undefined) {
                        t.parentNode.insertBefore(span, t.nextSibling);
                    } else {
                        document.getElementById(target).appendChild(span);
                    }
                    if (MM.tip) {
                        MM.tip.show("#" + id, text, "bottom center", "red");
                        setTimeout(function () {
                            $("#" + id).tooltip('destroy');
                        }, 5000);
                    }
                    return true;
                } else {
                    if (target === undefined) {
                        if (t.nextElementSibling !== null && t.nextElementSibling.className === "MM_VALIDATE_EMPTY") {
                            t.parentNode.removeChild(t.nextElementSibling);
                        }
                    }
                }

                break;
        }

        return false;
    }

})(MM);