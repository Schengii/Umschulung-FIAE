#include "Input.hpp"

namespace Minecraft {

GLFWwindow* Input::s_Window = nullptr;
double Input::s_MouseX = 0.0;
double Input::s_MouseY = 0.0;
double Input::s_LastMouseX = 0.0;
double Input::s_LastMouseY = 0.0;
double Input::s_MouseDX = 0.0;
double Input::s_MouseDY = 0.0;
double Input::s_ScrollY = 0.0;
bool Input::s_FirstMouse = true;
std::string Input::s_TypedChars;

void Input::init(GLFWwindow* window) {
    s_Window = window;
    glfwSetCursorPosCallback(window, cursorPosCallback);
    glfwSetScrollCallback(window, scrollCallback);
    glfwSetCharCallback(window, charCallback);
}

bool Input::isKeyPressed(int key) {
    if (!s_Window)
        return false;
    return glfwGetKey(s_Window, key) == GLFW_PRESS;
}

bool Input::isMouseButtonPressed(int button) {
    if (!s_Window)
        return false;
    return glfwGetMouseButton(s_Window, button) == GLFW_PRESS;
}

void Input::updateMouseDelta() {
    s_MouseDX = 0.0;
    s_MouseDY = 0.0;
}

void Input::cursorPosCallback(GLFWwindow* window, double xpos, double ypos) {
    (void)window;
    if (s_FirstMouse) {
        s_LastMouseX = xpos;
        s_LastMouseY = ypos;
        s_FirstMouse = false;
    }

    s_MouseX = xpos;
    s_MouseY = ypos;
    // Accumulate so that several cursor events within one frame are not lost.
    s_MouseDX += xpos - s_LastMouseX;
    s_MouseDY += s_LastMouseY - ypos; // Reversed since y-coordinates go from bottom to top

    s_LastMouseX = xpos;
    s_LastMouseY = ypos;
}

std::string Input::consumeTypedChars() {
    std::string out;
    out.swap(s_TypedChars);
    return out;
}

void Input::charCallback(GLFWwindow* window, unsigned int codepoint) {
    (void)window;
    if (codepoint >= 32 && codepoint < 127 && s_TypedChars.size() < 64) {
        s_TypedChars.push_back(static_cast<char>(codepoint));
    }
}

void Input::scrollCallback(GLFWwindow* window, double xoffset, double yoffset) {
    (void)window;
    (void)xoffset;
    s_ScrollY += yoffset;
}

} // namespace Minecraft
