const webpack = require('webpack');

const banner = `
/*!
 * -----------------------------------------------------------------------------
 * Diktup
 * Elevok
 * -----------------------------------------------------------------------------
 *
 * Copyright © ${new Date().getFullYear()} Diktup. All rights reserved.
 * 
 * This source code is the property of Diktup and its licensors.
 * It is proprietary and confidential. Unauthorized copying of this file, via
 * any medium, is strictly prohibited.
 * 
 * For inquiries, contact: legal@diktup.com
 * 
 * -----------------------------------------------------------------------------
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
 * OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 * LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 * EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 * -----------------------------------------------------------------------------
*/
`;

const utf8BannerText = Buffer.from(banner, 'utf-8').toString();
module.exports = {
  output: {
    publicPath: 'https://widgt-sbx-app.bosk.app/',
  },
  plugins: [
    new webpack.BannerPlugin({
      banner: utf8BannerText,
      raw: true,
    }),
  ],
};
